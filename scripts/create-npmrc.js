const fs = require("fs")
const path = require("path")

function createNpmrcFile() {
  // Check if required environment variables exist
  const npmToken = process.env.NPM_TOKEN
  const npmRegistry =
    process.env.NPM_REGISTRY_URL || "https://registry.npmjs.org/"
  const npmScope = process.env.NPM_SCOPE || ""

  // Only proceed if token is available
  if (!npmToken) {
    console.warn("No NPM_TOKEN found. Skipping .npmrc generation.")
    return
  }

  // Construct .npmrc content
  const npmrcContent = `
${npmScope ? `@${npmScope}:registry=${npmRegistry}` : ""}
//${new URL(npmRegistry).hostname}/:_authToken=${npmToken}
always-auth=true
  `.trim()

  // Write .npmrc file
  const npmrcPath = path.resolve(process.cwd(), ".npmrc")

  try {
    fs.writeFileSync(npmrcPath, npmrcContent)
    console.log("Successfully created .npmrc file")
  } catch (error) {
    console.error("Failed to create .npmrc file:", error)
    process.exit(1)
  }
}
