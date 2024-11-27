export const EnvConfiguration = () => ({

    neo4j: {
        uri: process.env.NEO4J_URI,
        username: process.env.NEO4J_USERNAME,
        password: process.env.NEO4J_PASSWORD,
    },

    jwt: {
        secret: process.env.JWT_SECRET,
    }
});