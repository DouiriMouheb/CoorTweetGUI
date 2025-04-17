# Create a function to handle errors by returning them in JSON format
handle_error <- function(stage, message) {
    error_output <- list(
        status = "error",
        error = list(
            stage = stage,
            message = message
        )
    )
    cat(toJSON(error_output, auto_unbox = TRUE, pretty = TRUE))
    q(status = 0) # Exit with status 0 so the JSON is properly returned
}

# Load necessary libraries with error checking
tryCatch(
    {
        library(httr)
        library(CooRTweet)
        library(jsonlite)
        library(igraph)
    },
    error = function(e) {
        handle_error("library_loading", paste("Failed to load required packages:", e$message))
    }
)

# Get command-line arguments (from Node.js)
args <- commandArgs(trailingOnly = TRUE)

if (length(args) < 5) {
    handle_error("arguments", "Missing arguments! Required: min_participation, time_window, subgraph, edge_weight, file_path")
}

# Read input parameters with validation
tryCatch(
    {
        min_participation <- as.numeric(args[1])
        time_window <- as.numeric(args[2])
        subgraph <- as.numeric(args[3])
        edge_weight <- as.numeric(args[4])
        file_path <- args[5]

        if (is.na(min_participation) || is.na(time_window) || is.na(subgraph) || is.na(edge_weight)) {
            stop("Invalid numeric parameters")
        }
    },
    error = function(e) {
        handle_error("parameter_parsing", paste("Error parsing parameters:", e$message))
    }
)

# Check if file exists
if (!file.exists(file_path)) {
    handle_error("file_access", paste("File does not exist:", file_path))
}

# Read the data with error handling
data <- tryCatch(
    {
        read.csv(file_path, stringsAsFactors = FALSE)
    },
    error = function(e) {
        handle_error("file_reading", paste("Error reading CSV file:", e$message))
    }
)

# Check if data is empty
if (nrow(data) == 0) {
    handle_error("empty_data", "The input file contains no data")
}

# Detect coordinated groups with error handling
result <- tryCatch(
    {
        detect_groups(
            x = data,
            min_participation = min_participation,
            time_window = time_window
        )
    },
    error = function(e) {
        handle_error("detect_groups", paste("Error in detecting coordinated groups:", e$message))
    }
)

# Check if any coordinated behavior was detected
if (nrow(result) == 0) {
    handle_error("no_coordination", "No coordinated behavior detected with the specified parameters.")
}

# Generate the coordinated network graph with error handling
graph <- tryCatch(
    {
        generate_coordinated_network(
            result,
            edge_weight = edge_weight,
            subgraph = subgraph
        )
    },
    error = function(e) {
        handle_error("network_generation", paste("Error generating coordinated network:", e$message))
    }
)

# Ensure graph is not empty (nodes)
# if (vcount(graph) == 0) {
#    handle_error("empty_graph_nodes", "The generated graph has no nodes. Try decreasing the subgraph parameter.")
# }

# Ensure graph is not empty (edges)
if (ecount(graph) == 0) {
    handle_error("empty_graph_edges", "The generated graph has no edges. Try decreasing the edge_weight parameter.")
}

# Extract edges from the graph
edges <- tryCatch(
    {
        as_data_frame(graph, what = "edges")
    },
    error = function(e) {
        handle_error("edge_extraction", paste("Error extracting edges from graph:", e$message))
    }
)

# Now you can use edges
edges <- tryCatch(
    {
        edges[, c("from", "to", setdiff(colnames(edges), c("from", "to")))]
    },
    error = function(e) {
        handle_error("edge_processing", paste("Error processing edge data:", e$message))
    }
)

# Create graph from edge data
g <- tryCatch(
    {
        graph_from_data_frame(edges, directed = FALSE)
    },
    error = function(e) {
        handle_error("graph_creation", paste("Error creating graph from edge data:", e$message))
    }
)

# Detect communities
louvain_result <- tryCatch(
    {
        cluster_louvain(g)
    },
    error = function(e) {
        handle_error("community_detection", paste("Error in community detection:", e$message))
    }
)

# Check if communities were detected
if (length(unique(membership(louvain_result))) <= 1) {
    handle_error("single_community", "Only one community was detected. Consider adjusting parameters to find more distinct communities.")
}

community_membership <- membership(louvain_result)

# Extract vertices
vertices <- tryCatch(
    {
        data.frame(
            row = V(g)$name,
            name = V(g)$name
        )
    },
    error = function(e) {
        handle_error("vertex_extraction", paste("Error extracting vertices from graph:", e$message))
    }
)

# Assign community IDs to each node
vertices$community <- community_membership

# Modify JSON output
output <- tryCatch(
    {
        list(
            status = "success",
            edges = edges,
            vertices = apply(vertices, 1, function(row) {
                list(`_row` = row["row"], name = row["name"], community = as.numeric(row["community"]))
            })
        )
    },
    error = function(e) {
        handle_error("output_preparation", paste("Error preparing output:", e$message))
    }
)

# Print JSON output
tryCatch(
    {
        cat(toJSON(output, auto_unbox = TRUE, pretty = TRUE))
    },
    error = function(e) {
        handle_error("json_conversion", paste("Error converting to JSON:", e$message))
    }
)
