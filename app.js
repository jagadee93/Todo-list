//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const ejs = require("ejs");
const _ = require("lodash")
app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/tasklistDB")
 const TasksSchema = new mongoose.Schema({
  name:{
    type:String
    // required:[true,"please enter task"]
  }
});

const Task =mongoose.model("Task",TasksSchema);
const task1 =new Task({
  name:"open udemy and learn full stack"
});
const task2 =new Task({
  name:"prepare food"
});
const task3 =new Task({
  name:"eat food"
});


const default_data=[task1,task2,task3]


app.get("/", (req, res) => {
  Task.find({},(err,task) => {
    if (err){
      console.log(err);
    }
    if (task.length===0){
              Task.insertMany(default_data,function(err){
              if (err) {
                  console.log(err);
              } else{
                console.log("success fully inserted !");
                }
                });
      res.redirect("/");
    }else{
      res.render("list", {listTitle:"Today", tasks: task});
    };
    });
    });
app.post("/",(req, res)=>{
  const item = req.body.newItem;
  const listName= req.body.list;
  console.log("listname"+listName);
  const task = new Task({
    name:item
  })
if (listName === "today"){
  task.save();
  res.redirect("/");
}else{
  List.findOne({name:listName},(err,foundList)=>{
    foundList.items.push(task);
    foundList.save();
    res.redirect("/"+listName);
  });
}
});
const ListSchema = {
  name: String,
  items: [TasksSchema]
};
const List = mongoose.model("List", ListSchema);
app.get("/:newListName", (req,res) => {
  const newListName = _.capitalize(req.params.newListName);
  List.findOne({name:newListName}, (err,foundList)=>{
    if (!err) {
      if (!foundList){
        //create new list
        const list = new List({
          name: newListName,
          items: default_data
        });
        list.save();
        res.redirect("/"+newListName);
      }else{//this is the path where we show the list
        res.render("list", {listTitle:foundList.name,tasks:foundList.items});
      }
    }
    });
  
});

app.get("/about", (req, res) => {
  res.render("about");
});


app.post("/delete",(req, res) => {
  const checked_item =req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "today"){
    Task.findByIdAndDelete(checked_item,function(err){
      if (err) {
        console.log(err)
      }else {
        console.log("Task deleted successfully")
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checked_item}}},(err,foundList) =>{
      if (!err){
        console.log("custom"+"Task deleted successfully")
        res.redirect("/"+ listName);
      }
    });
  }
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started successfully");
});
