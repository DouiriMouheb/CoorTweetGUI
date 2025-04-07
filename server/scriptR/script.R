# Enable error logging
options(error = function() {
  err_msg <- geterrmessage()
  write(err_msg, stderr())
  q(status = 1) # Exit with error code
})

# Load necessary libraries
library(httr)
library(CooRTweet)
library(jsonlite)
library(igraph)

# Get command-line arguments (from Node.js)
args <- commandArgs(trailingOnly = TRUE)

if (length(args) < 5) {
  write("Error: Missing arguments!", stderr())
  q(status = 1)
}

# Read input parameters
min_participation <- as.numeric(args[1])
time_window <- as.numeric(args[2])
subgraph <- as.numeric(args[3])
edge_weight <- as.numeric(args[4])
file_path <- args[5]

if (!file.exists(file_path)) {
  write(paste("Error: File does not exist -", file_path), stderr())
  q(status = 1)
}

# API credentials
api_key <- "9A69yRGDmtACyo2DPDTlurOwj4lTWZByyEM7blERV0W5o2aHxqy0Kv4rlM3elRe596QstC6JAOPMPrnkiN8vUYggFYWQadg26mj6hyYix3eMOStQbDdRAkAa08iAEKDn"
url <- "https://coortweet-be.lab.atc.gr/default"

# Build API query
url <- paste0(
  url, "?min_participation=", min_participation,
  "&time_window=", time_window,
  "&subgraph=", subgraph,
  "&edge_weight=", edge_weight
)

# Set API headers
headers <- c(`X-Api-Key` = api_key)

# Make API request
response <- tryCatch(
  {
    POST(
      url,
      add_headers(.headers = headers),
      body = list(`input.csv` = upload_file(file_path)),
      encode = "multipart"
    )
  },
  error = function(e) {
    write(paste("API Request Error:", e$message), stderr())
    q(status = 1)
  }
)

# Get response content
content_as_text <- tryCatch(
  {
    content(response, "text")
  },
  error = function(e) {
    write("Error: Could not parse API response", stderr())
    q(status = 1)
  }
)

json_data <- tryCatch(
  {
    fromJSON(content_as_text)
  },
  error = function(e) {
    write("Error: API response is not valid JSON", stderr())
    q(status = 1)
  }
)

if (!"edges" %in% names(json_data)) {
  write("Error: 'edges' field missing in API response", stderr())
  q(status = 1)
}

# Extract edges
edges <- json_data$edges

# Create network graph
edges <- edges[, c("from", "to", setdiff(colnames(edges), c("from", "to")))]
g <- tryCatch(
  {
    graph_from_data_frame(edges, directed = FALSE)
  },
  error = function(e) {
    write("Error: Failed to create graph", stderr())
    q(status = 1)
  }
)

# Detect communities
louvain_result <- tryCatch(
  {
    cluster_louvain(g)
  },
  error = function(e) {
    write("Error: Community detection failed", stderr())
    q(status = 1)
  }
)

community_membership <- membership(louvain_result)

# Extract vertices
vertices <- data.frame(
  row = V(g)$name,
  name = V(g)$name
)

# Assign community IDs to each node
vertices$community <- community_membership

# Modify JSON output
output <- list(
  edges = edges,
  vertices = apply(vertices, 1, function(row) {
    list(`_row` = row["row"], name = row["name"], community = as.numeric(row["community"]))
  })
)

# Print JSON output
cat(toJSON(output, auto_unbox = TRUE, pretty = TRUE))
