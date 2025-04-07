# Enable error logging
options(error = function() {
    err_msg <- geterrmessage()
    write(err_msg, stderr())
    q(status = 1) # Exit with error code
})

# Load necessary libraries
library(igraph)
library(jsonlite)
library(data.table)

# Get command-line arguments
args <- commandArgs(trailingOnly = TRUE)

if (length(args) < 5) {
    write("Error: Missing required arguments!", stderr())
    q(status = 1)
}

# Read input parameters
min_participation <- as.numeric(args[1]) # Minimum shares required
time_window <- as.numeric(args[2]) # Time window in seconds
subgraph <- as.numeric(args[3]) # Subgraph extraction (1 = largest component)
edge_weight <- as.numeric(args[4]) # Edge weight threshold
file_path <- args[5] # File path

if (!file.exists(file_path)) {
    write(paste("Error: File does not exist -", file_path), stderr())
    q(status = 1)
}

# Load data
data <- fread(file_path, colClasses = c("character", "character", "character", "integer"))

# Ensure required columns exist
required_cols <- c("object_id", "account_id", "content_id", "timestamp_share")
if (!all(required_cols %in% colnames(data))) {
    write("Error: Missing required columns in CSV file!", stderr())
    q(status = 1)
}

# Sort data by object_id and timestamp
setorder(data, object_id, timestamp_share)

# Create edges by linking users who shared the same object_id within the time window
edges_list <- list()

for (object in unique(data$object_id)) {
    obj_data <- data[object_id == object] # Filter by object_id

    if (nrow(obj_data) >= min_participation) { # Apply min_participation filter
        for (i in 1:(nrow(obj_data) - 1)) {
            for (j in (i + 1):nrow(obj_data)) {
                if (abs(obj_data$timestamp_share[i] - obj_data$timestamp_share[j]) <= time_window) {
                    edges_list <- append(edges_list, list(
                        list(from = obj_data$account_id[i], to = obj_data$account_id[j])
                    ))
                } else {
                    break # Stop checking once time window is exceeded
                }
            }
        }
    }
}

# Convert edges list to data.table
edges <- rbindlist(edges_list, fill = TRUE)

# Apply edge weight threshold
edges[, weight := .N, by = .(from, to)] # Compute weight as number of interactions
edges <- edges[weight >= edge_weight] # Filter by weight

# Remove duplicate edges
edges <- unique(edges)

# Create graph
g <- tryCatch(
    {
        graph_from_data_frame(edges, directed = FALSE)
    },
    error = function(e) {
        write("Error: Failed to create graph", stderr())
        q(status = 1)
    }
)

# Extract largest subgraph if requested
if (subgraph == 1) {
    components <- components(g)
    largest_component <- which.max(components$csize)
    g <- induced_subgraph(g, which(components$membership == largest_component))
}

# Detect communities using Louvain method
louvain_result <- tryCatch(
    {
        cluster_louvain(g)
    },
    error = function(e) {
        write("Error: Community detection failed", stderr())
        q(status = 1)
    }
)

# Extract community memberships
community_membership <- membership(louvain_result)

# Extract vertices
vertices <- data.frame(
    id = V(g)$name,
    community = community_membership
)

# Create JSON output
output <- list(
    edges = edges[, .(from, to, weight)],
    vertices = apply(vertices, 1, function(row) {
        list(id = row["id"], community = as.numeric(row["community"]))
    })
)

# Print JSON output
cat(toJSON(output, auto_unbox = TRUE, pretty = TRUE))
