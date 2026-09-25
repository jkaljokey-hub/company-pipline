const request = require("supertest");
const app = require("../server");

describe("Application", () => {

    test("GET / should return 200", async () => {
        const response = await request(app).get("/");
        expect(response.statusCode).toBe(200);
    });

    test("GET /health should return healthy", async () => {
        const response = await request(app).get("/health");

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("healthy");
    });

    test("GET /version should return version", async () => {
        const response = await request(app).get("/version");

        expect(response.statusCode).toBe(200);
        expect(response.body.version).toBe("1.0.0");
    });
    
    test("Get /cloud should return cloud",async ()=> {
        const response=await request(app).get("/cloud");

        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe("bakry")
        expect(response.body.age).toBe("29")
    })

});
