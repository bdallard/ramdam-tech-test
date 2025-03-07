PROJECT_NAME = image-analyzer
NODE_ENV ?= development
PORT ?= 3000
CONTAINER_NAME = $(PROJECT_NAME)-container
IMAGE_NAME = $(PROJECT_NAME)-image
HOST_PORT = 3000
CONTAINER_PORT = 3000
DOCKER = docker
NODE = node
NPM = npm
TS_NODE = npx ts-node
NODEMON = npx nodemon
CURL = curl
SRC_DIR = src
DIST_DIR = dist
NODE_MODULES = node_modules
CONFIG_DIR = $(SRC_DIR)/config
ROUTES_DIR = $(SRC_DIR)/routes
SERVICES_DIR = $(SRC_DIR)/services
LOGS_DIR = logs
DOCKERFILE = Dockerfile
DOCKER_COMPOSE = docker-compose.yml
API_BASE_URL = http://localhost:$(PORT)/test
UNSPLASH_TEST_ENDPOINT = $(API_BASE_URL)/unsplash
VISION_TEST_ENDPOINT = $(API_BASE_URL)/vision
COMBINED_TEST_ENDPOINT = $(API_BASE_URL)/combined-test

.PHONY: default
default: help

.PHONY: help
help:
	@echo "Image Analyzer API - Make commands"
	@echo ""
	@echo "Usage:"
	@echo "  make [command]"
	@echo ""
	@echo "Development Commands:"
	@echo "  help                 Display this help message"
	@echo "  install              Install dependencies"
	@echo "  dev                  Start the development server with hot-reloading"
	@echo "  build                Build the project for production"
	@echo "  start                Start the production server"
	@echo "  clean                Remove built files and dependencies"
	@echo "  check-env            Check if all required environment variables are set"
	@echo "  create-env           Create a template .env file"
	@echo "  setup                Full setup: install dependencies and create env file"
	@echo ""
	@echo "Testing Commands:"
	@echo "  test-unsplash        Test the Unsplash API service (optional: KEYWORD=value LIMIT=number)"
	@echo "  test-vision          Test the Google Vision API service (required: IMAGE_URL=url)"
	@echo "  test-combined        Test both APIs together (optional: KEYWORD=value LABEL=value)"
	@echo ""
	@echo "Docker Commands:"
	@echo "  docker-build         Build the Docker image"
	@echo "  docker-run           Run the Docker container with volume mount (development mode)"
	@echo "  docker-prod          Run the Docker container in production mode"
	@echo "  docker-stop          Stop the Docker container"
	@echo "  docker-clean         Remove Docker container and image"
	@echo "  docker-dev           One command to build and run Docker with volume mount"
	@echo "  docker-logs          View Docker container logs"
	@echo "  docker-bash          Access container shell"
	@echo ""
	@echo "Examples:"
	@echo "  make test-vision IMAGE_URL=https://example.com/image.jpg"
	@echo "  make test-combined KEYWORD=city LABEL=building"
	@echo "  make docker-dev"
	@echo ""

.PHONY: install
install:
	@echo "Installing dependencies..."
	@$(NPM) install
	@echo "Dependencies installed successfully!"

.PHONY: dev
dev:
	@echo "Starting development server..."
	@$(NPM) run dev

.PHONY: build
build:
	@echo "Building project for production..."
	@$(NPM) i && $(NPM) run build
	@echo "Build completed!"

.PHONY: start
start: build
	@echo "Starting production server..."
	@$(NODE) $(DIST_DIR)/server.js

.PHONY: clean
clean:
	@echo "Cleaning project..."
	@rm -rf $(DIST_DIR)
	@rm -rf $(NODE_MODULES)
	@echo "Project cleaned!"

.PHONY: test-unsplash
test-unsplash: _ensure-server-running
	@echo "Testing Unsplash API..."
	@KEYWORD_PARAM=$${KEYWORD:+?keyword=$(KEYWORD)}; \
	LIMIT_PARAM=$${LIMIT:+$${KEYWORD_PARAM:+&}$${KEYWORD_PARAM:-?}limit=$(LIMIT)}; \
	FULL_URL="$(UNSPLASH_TEST_ENDPOINT)$${KEYWORD_PARAM}$${LIMIT_PARAM}"; \
	echo "Calling: $$FULL_URL"; \
	$(CURL) -s $$FULL_URL | jq

# TODO: fix this test
.PHONY: test-vision
test-vision: _ensure-server-running
	@if [ -z "$(IMAGE_URL)" ]; then \
		echo "Error: IMAGE_URL parameter is required"; \
		echo "Usage: make test-vision IMAGE_URL=https://images.unsplash.com/photo-1421789665209-c9b2a435e3dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MTg2MzJ8MHwxfHNlYXJjaHw1fHxuYXR1cmV8ZW58MHx8fHwxNzQxMzAxNzIxfDA&ixlib=rb-4.0.3&q=80&w=1080; \
		exit 1; \
	fi
	@echo "Testing Google Vision API with image: $(IMAGE_URL)"
	@$(CURL) -s "$(VISION_TEST_ENDPOINT)?imageUrl=$(IMAGE_URL)" | jq

.PHONY: test-combined
test-combined: _ensure-server-running
	@echo "Testing combined APIs..."
	@KEYWORD_PARAM=$${KEYWORD:+?keyword=$(KEYWORD)}; \
	LABEL_PARAM=$${LABEL:+$${KEYWORD_PARAM:+&}$${KEYWORD_PARAM:-?}label=$(LABEL)}; \
	FULL_URL="$(COMBINED_TEST_ENDPOINT)$${KEYWORD_PARAM}$${LABEL_PARAM}"; \
	echo "Calling: $$FULL_URL"; \
	$(CURL) -s $$FULL_URL | jq

# Helper function to ensure server is running before tests
.PHONY: _ensure-server-running
_ensure-server-running:
	@echo "Checking if server is running on port $(PORT)..."
	@if ! nc -z localhost $(PORT) > /dev/null 2>&1; then \
		echo "Warning: Server doesn't appear to be running on port $(PORT)."; \
		echo "Please start the server with 'make dev' or 'make docker-dev' before running tests."; \
		echo "Continuing anyway, but tests may fail if server is not available."; \
	else \
		echo "Server is running on port $(PORT)."; \
	fi

.PHONY: check-env
check-env:
	@echo "Checking environment variables..."
	@if [ ! -f .env ]; then \
		echo "Warning: .env file not found"; \
	else \
		echo "Environment file exists."; \
	fi
	@if [ -z "$$UNSPLASH_ACCESS_KEY" ]; then \
		echo "Warning: UNSPLASH_ACCESS_KEY is not set in environment"; \
	else \
		echo "UNSPLASH_ACCESS_KEY is set."; \
	fi
	@if [ -z "$$GOOGLE_APPLICATION_CREDENTIALS" ]; then \
		echo "Warning: GOOGLE_APPLICATION_CREDENTIALS is not set in environment"; \
	else \
		echo "GOOGLE_APPLICATION_CREDENTIALS is set to: $$GOOGLE_APPLICATION_CREDENTIALS"; \
	fi

.PHONY: create-env
create-env:
	@if [ -f .env ]; then \
		echo ".env file already exists. Use make force-create-env to overwrite."; \
	else \
		echo "Creating .env file template..."; \
		echo "PORT=$(PORT)" > .env; \
		echo "NODE_ENV=$(NODE_ENV)" >> .env; \
		echo "UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here" >> .env; \
		echo "GOOGLE_APPLICATION_CREDENTIALS=path/to/your-credentials.json" >> .env; \
		echo ".env file created. Please edit it with your actual API keys."; \
	fi

#force to create .env file if existing
.PHONY: force-create-env
force-create-env:
	@echo "Creating .env file template (overwriting existing)..."
	@echo "PORT=$(PORT)" > .env
	@echo "NODE_ENV=$(NODE_ENV)" >> .env
	@echo "UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here" >> .env
	@echo "GOOGLE_APPLICATION_CREDENTIALS=path/to/your-credentials.json" >> .env
	@echo ".env file created. Please edit it with your actual API keys."

.PHONY: docker-build
docker-build:
	@echo "Building Docker image..."
	@$(DOCKER) build -t $(IMAGE_NAME) .

.PHONY: docker-run
docker-run:
	@echo "Running Docker container (development mode)..."
	@$(DOCKER) run \
		--name $(CONTAINER_NAME) \
		-p $(HOST_PORT):$(CONTAINER_PORT) \
		--env-file .env \
		$(IMAGE_NAME)
	@echo "Container is running on http://localhost:$(HOST_PORT)"
	@echo "Changes to your local files will be reflected without rebuilding."

.PHONY: docker-prod
docker-prod:
	@echo "Running Docker container in production mode..."
	@$(DOCKER) run --rm -d \
		--name $(CONTAINER_NAME)-prod \
		-p $(HOST_PORT):$(CONTAINER_PORT) \
		--env-file .env \
		$(IMAGE_NAME)
	@echo "Production container is running on http://localhost:$(HOST_PORT)"

.PHONY: docker-stop
docker-stop:
	@echo "Stopping Docker container..."
	@if $(DOCKER) ps -q --filter "name=$(CONTAINER_NAME)" | grep -q .; then \
		$(DOCKER) stop $(CONTAINER_NAME); \
	else \
		echo "Container $(CONTAINER_NAME) is not running."; \
	fi
	@if $(DOCKER) ps -q --filter "name=$(CONTAINER_NAME)-prod" | grep -q .; then \
		$(DOCKER) stop $(CONTAINER_NAME)-prod; \
	else \
		echo "Container $(CONTAINER_NAME)-prod is not running."; \
	fi

.PHONY: docker-clean
docker-clean: docker-stop
	@echo "Removing Docker container and image..."
	@if $(DOCKER) ps -a -q --filter "name=$(CONTAINER_NAME)" | grep -q .; then \
		$(DOCKER) rm $(CONTAINER_NAME); \
	fi
	@if $(DOCKER) ps -a -q --filter "name=$(CONTAINER_NAME)-prod" | grep -q .; then \
		$(DOCKER) rm $(CONTAINER_NAME)-prod; \
	fi
	@if $(DOCKER) images -q $(IMAGE_NAME) | grep -q .; then \
		$(DOCKER) rmi $(IMAGE_NAME); \
	fi
	@echo "Docker cleanup completed!"

.PHONY: docker-dev
docker-dev: docker-build docker-run
	@echo "✅ Docker development environment is ready! ✅"
	@echo "Access the API at http://localhost:$(HOST_PORT)"
	@echo "Run 'make docker-logs' to see container logs"

.PHONY: docker-logs
docker-logs:
	@echo "Showing Docker container logs (Ctrl+C to exit)..."
	@$(DOCKER) logs -f $(CONTAINER_NAME)

.PHONY: docker-bash
docker-bash:
	@echo "Accessing container shell..."
	@$(DOCKER) exec -it $(CONTAINER_NAME) /bin/sh