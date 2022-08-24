# canvas-icons-library

# Running on Docker

    docker build -t canvas-icons-editor .
    docker run -p 3000:3000 --init -it --rm -v [PATH TO LOCAL FILE]:/srv/icons canvas-icons-editor
