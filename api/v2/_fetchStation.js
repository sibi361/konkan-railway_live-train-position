export default async (req, res) => {
    res.status(400).send({
        message: "Error: Station name parameter not provided",
        example: "/api/v2/fetchStation/<station-name>",
        success: false,
    });
};
