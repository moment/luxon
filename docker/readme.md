Luxon provides a Docker container and some wrapping scripts to make it easier to run the tests.

  1. The Dockerfile is really just here as an FYI. You shouldn't need to interact with it
  1. `install` is a bash script that runs `npm install` insider the Docker container.
  1. `gulp` is a bash script that runs Gulp inside the Docker container
