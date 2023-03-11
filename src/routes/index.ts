import express, { Request, Response } from 'express';


const router = express.Router();
router.get("/hello", (req: Request, res: Response) => {
    res.json({hello: "hello world"})
})

export default router;