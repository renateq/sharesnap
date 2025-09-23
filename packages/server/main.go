package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// Message: flexible container used for signaling.
// type: "register" | "registered" | "connect" | "connected" | "offer" | "answer" | "candidate" | "disconnected" | "error"
// id: used for connect/register responses
// payload: raw JSON that carries SDP / ICE / image / etc. We forward it verbatim.
type Message struct {
	Type    string          `json:"type"`
	ID      string          `json:"id,omitempty"`
	Error   string          `json:"error,omitempty"`
	Payload json.RawMessage `json:"payload,omitempty"`
}

// Client wraps a websocket connection and a write mutex so multiple goroutines
// can safely send to the same connection (no concurrent writes).
type Client struct {
	conn      *websocket.Conn
	writeLock sync.Mutex
}

// Convenience to write JSON with the per-client write lock.
func (c *Client) Send(msg Message) error {
	c.writeLock.Lock()
	defer c.writeLock.Unlock()

	data, err := json.Marshal(msg)
	if err != nil {
		return err
	}
	return c.conn.WriteMessage(websocket.TextMessage, data)
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// For production, restrict origins properly.
		return true
	},
}

// Global state guarded by mapsMu
var (
	mapsMu   sync.Mutex
	waiting  = make(map[string]*Client)  // socketID -> Client (waiting for a pair)
	pairings = make(map[*Client]*Client) // client -> paired client
)

func handleWS(w http.ResponseWriter, r *http.Request) {
	// Upgrade HTTP -> WebSocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade:", err)
		return
	}
	client := &Client{conn: ws}

	// Ensure cleanup on exit
	defer func() {
		cleanupClient(client)
		_ = ws.Close()
	}()

	for {
		_, raw, err := ws.ReadMessage()
		if err != nil {
			// Read error (client closed connection or network error)
			log.Printf("read error: %v\n", err)
			return
		}

		var msg Message
		if err := json.Unmarshal(raw, &msg); err != nil {
			log.Printf("invalid json: %s\n", string(raw))
			_ = client.Send(Message{Type: "error", Error: "invalid JSON"})
			continue
		}

		switch msg.Type {
		// Client requests a new ID to share with another peer.
		case "register":
			id := uuid.NewString()
			mapsMu.Lock()
			waiting[id] = client
			mapsMu.Unlock()

			if err := client.Send(Message{Type: "registered", ID: id}); err != nil {
				log.Println("send registered error:", err)
			}

		// Client wants to connect to an existing registered ID.
		// The server links the two clients and notifies both.
		case "connect":
			if msg.ID == "" {
				_ = client.Send(Message{Type: "error", Error: "missing id"})
				continue
			}

			mapsMu.Lock()
			target, ok := waiting[msg.ID]
			if !ok {
				mapsMu.Unlock()
				_ = client.Send(Message{Type: "error", Error: "invalid ID"})
				continue
			}

			// create 2-way pairing
			pairings[client] = target
			pairings[target] = client

			// remove from waiting set
			delete(waiting, msg.ID)
			mapsMu.Unlock()

			_ = client.Send(Message{Type: "connected"})
			_ = target.Send(Message{Type: "connected"})

			fmt.Println("Two sockets connected")

		// Forward offer / answer / candidate payload to paired peer.
		// The payload is forwarded as-is (good for SDP and ICE which are JSON or strings).
		case "offer", "answer", "candidate":
			mapsMu.Lock()
			peer := pairings[client]
			mapsMu.Unlock()

			if peer == nil {
				_ = client.Send(Message{Type: "error", Error: "not connected to a peer"})
				continue
			}

			// forward
			fwd := Message{
				Type:    msg.Type,
				Payload: msg.Payload,
			}
			if err := peer.Send(fwd); err != nil {
				log.Println("forward error:", err)
			}

		// Client voluntarily disconnecting / closing logical session
		case "disconnect":
			// trigger cleanup and notify peer
			cleanupClient(client)

		default:
			_ = client.Send(Message{Type: "error", Error: "unknown message type"})
		}
	}
}

// cleanupClient removes client from waiting map and pairings and notifies peer.
func cleanupClient(c *Client) {
	mapsMu.Lock()
	defer mapsMu.Unlock()

	// Remove from waiting (if any)
	for id, cl := range waiting {
		if cl == c {
			delete(waiting, id)
			break
		}
	}

	// Notify and unlink pair if exists
	if peer, ok := pairings[c]; ok && peer != nil {
		// notify peer
		_ = peer.Send(Message{Type: "disconnected"})
		// remove both directions
		delete(pairings, peer)
		delete(pairings, c)
	}
	fmt.Println("Number of sockets: ", len(pairings))
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	http.HandleFunc("/ws", handleWS)

	fmt.Println("WebSocket signaling server listening on :" + port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
