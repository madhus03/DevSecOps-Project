#  Uses a lightweight Alpine-based Node.js image to build the frontend.  
FROM node:16.17.0-alpine as builder  

# set the working directory inside the container 
WORKDIR /app 

# Copy the package.json from the local machine to container needed for dependency installation
COPY ./package.json . 

# copy the yarn.lock from local machine to container needed for dependency installation.
COPY ./yarn.lock . 

# Installs project dependencies using yarn
RUN yarn install 

 # Copies the rest of your app code (source files, components, etc.) into the container's /app directory.
COPY . .             

# declaring a build time variable. Pass the TMDB API KEY during Docker build 
ARG TMDB_V3_API_KEY   

# Converts the build-time ARG into a runtime environment variable that Vite can use when building the frontend.
ENV VITE_APP_TMDB_V3_API_KEY=${TMDB_V3_API_KEY} 

# Sets a public environment variable your app can read — likely used by the frontend to make API calls to TMDB.
ENV VITE_APP_API_ENDPOINT_URL="https://api.themoviedb.org/3" 

# Builds the optimized static files (like index.html, JS, CSS) for production. 
RUN yarn build 


# Uses a lightweight Alpine-based nginx image to build the frontend.  
FROM nginx:stable-alpine 

# Changes working directory to where Nginx serves static files by default.
WORKDIR /usr/share/nginx/html 

#  Clears any default files (like the default Nginx welcome page).
RUN rm -rf ./* 

# Copies the built app (from the dist folder in the first stage) into Nginx's serving directory.
COPY --from=builder /app/dist . 

# tells Docker that this container will serve traffic on port 80 (default HTTP port).
EXPOSE 80 

# start Nginx in the foreground to serve the app
ENTRYPOINT ["nginx", "-g", "daemon off;"] 
