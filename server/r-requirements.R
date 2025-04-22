options(repos = c(CRAN = "https://cloud.r-project.org/"))
options(Ncpus = parallel::detectCores())

# Install packages without unnecessary dependencies
install.packages("jsonlite")
install.packages("httr")

# Install larger packages with more careful dependency management
install.packages("igraph")
install.packages("CooRTweet")
