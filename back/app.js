const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors"); 

const app=express();
const PORT = process.env.PORT || 123;

app.use(cors());  // Enable CORS

app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/QusetionBank")
.then(()=> console.log("Connect DB Successfully... at port" + PORT))
.catch((error)=>console.log("Connection Fail...",error));

const QuestionSchema = new mongoose.Schema({
    QuestionNumber : Number,
    Question : String,
    A: String,
    B: String,
    C: String,
    D: String,
    CorrectAnswer: String,
    UserAnswer : String
},{versionKey:false});

const QuestionModel = mongoose.model("Question", QuestionSchema);

app.post('/question', async(req,res)=>{
    try {
        const { Question, A, B, C, D, CorrectAnswer, UserAnswer} =req.body;
        const totalquestion = await QuestionModel.find().countDocuments();
        const ques = new QuestionModel({QuestionNumber:totalquestion+1, Question, A, B, C, D, CorrectAnswer, UserAnswer});
        await ques.save();
        console.log(totalquestion)
        console.log("store successfully");
        res.status(200).json(ques);
    } catch (error) {
        res.status(400).json({error:error.message});
    }
})

app.get('/question', async(req,res)=>{
    try {
        const questionnum = req.params.QuestionNumber;
        const choosequesnum = await QuestionModel.findOne({QuestionNumber:questionnum});
        console.log(choosequesnum);
        if(!choosequesnum){
            res.status(404).json("Question not availble")
        }
        res.send(choosequesnum);
    } catch (error){
        res.status(500).json({error: error.message});
    }
})
app.get('/questions', async(req, res) => {
    try {
        const { page = 3, limit = 5 } = req.query;
        const questions = await QuestionModel.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await QuestionModel.countDocuments();

        res.json({
            questions,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});





app.put('/question/QuestionNumber', async (req, res) => {
    try {
        const questionnum = req.body.QuestionNumber;
        const userinputans = req.body.UserAnswer;
        const choosequesnum = await QuestionModel.findOne({QuestionNumber:questionnum});
        if(userinputans !== choosequesnum.CorrectAnswer){
            res.send("Wrong Answer Try Again");
        }else{
            res.send("right answer");
        }
        res.status(200).json();
    } catch (error){
        res.status(404).json({error: error.message});
    }
});
app.listen(PORT,()=>{
    console.log("server is running on port "+ PORT);
});