# Load required libraries
library(CooRTweet)
library(readr)
library(igraph)
library(jsonlite)

# Read the data
data <- read_csv("pope_sick.csv")

# Detect coordinated groups
result <- detect_groups(
    x = data,
    min_participation = 2,
    time_window = 60
)

# Generate the coordinated network graph
graph <- generate_coordinated_network(
    result,
    edge_weight = 0.5,
    subgraph = 1
)

# Debugging: Print graph structure
print("Checking graph structure...")
print(graph)
str(graph)

# Ensure graph is not empty
if (ecount(graph) == 0) {
    stop("Error: The generated graph has no edges.")
}

# Extract edges safely
edges <- tryCatch(
    {
        edges_df <- as.data.frame(get.edgelist(graph))
        colnames(edges_df) <- c("from", "to")
        edges_df
    },
    error = function(e) {
        stop("Error: Could not extract edges from graph.")
    }
)

# Print edges for verification
print("Edges extracted:")
print(head(edges))

# Count edges in the graph
num_edges <- gsize(graph)
print(paste("Number of edges:", num_edges))

# Detect communities using Louvain method
louvain_result <- tryCatch(
    {
        cluster_louvain(graph)
    },
    error = function(e) {
        stop("Error: Community detection failed.")
    }
)

# Assign communities to each node
community_membership <- membership(louvain_result)

# Extract vertices
vertices <- data.frame(
    row = V(graph)$name,
    name = V(graph)$name,
    community = community_membership
)

# Modify JSON output
output <- list(
    edges = edges,
    vertices = lapply(1:nrow(vertices), function(i) {
        list(
            `_row` = vertices$row[i],
            name = vertices$name[i],
            community = as.numeric(vertices$community[i])
        )
    })
)

# Print JSON output
cat(toJSON(output, auto_unbox = TRUE, pretty = TRUE))
