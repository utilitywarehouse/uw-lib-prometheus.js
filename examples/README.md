# Build and run

    npm install
    node express.js
    
# Make some traffic

	siege -c10 -d 2 0.0.0.0:3000
	
# Verify

Go to `http://0.0.0.0:3000/metrics` refresh mad and enjoy.
