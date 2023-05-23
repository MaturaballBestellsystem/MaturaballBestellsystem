# Start client server
cd client
npm start > /dev/null 2>&1 &

# Store the client server process ID
client_pid=$!

# Start server server
cd ../server
npm start > /dev/null 2>&1 &

# Store the server server process ID
server_pid=$!

echo "Node servers started."

# Function to stop the servers
stop_servers() {
  echo "Stopping Node servers..."

  # Stop client server
  pkill -P $client_pid

  # Stop server server
  pkill -P $server_pid

  echo "Node servers stopped."
}

# Trap SIGINT (Ctrl+C) and call stop_servers function
trap stop_servers SIGINT

# Wait for the script to be terminated
wait
