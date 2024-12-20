import { ApiServer } from "lib/server/ApiServer"

const server = new ApiServer()
console.log(`Server started at ${server.url}`)

server.run()
