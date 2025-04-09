export default async (req, res) => {
    res.status(400).send({
        message: "Error: Train number parameter not provided",
        example: "/api/v2/fetchTrain/<train-number>",
        success: false,
    });
};
