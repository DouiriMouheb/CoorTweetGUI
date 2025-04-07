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
# Read the data
data <- read.csv(file_path, stringsAsFactors = FALSE)
# Detect coordinated groups
result <- detect_groups(
    x = data,
    min_participation = min_participation,
    time_window = time_window
)
# Generate the coordinated network graph
graph <- generate_coordinated_network(
    result,
    edge_weight = edge_weight,
    subgraph = subgraph
)

# Ensure graph is not empty
if (ecount(graph) == 0) {
    stop("Error: The generated graph has no edges.")
}

# Extract edges from the graph
edges <- as_data_frame(graph, what = "edges")

# Now you can use edges
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
