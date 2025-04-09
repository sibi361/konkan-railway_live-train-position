// Non-essential functions have been disabled by prefixing "_" to their
// name due to Vercel Serverless Function's max limit of 12

export default async (req, res) => {
    res.redirect("/");
};
