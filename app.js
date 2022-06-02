const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://Admin-Himasha:Test123@cluster0.hfeq2cs.mongodb.net/todoListDB");

const itemsSchema=new mongoose.Schema({
  name:String
});


const Item=mongoose.model("Item", itemsSchema);


const item1=new Item({
  name:"Wellcome to your todoList!"
});

const item2=new Item({
  name:"Hit the + button to add a new item."
});

const item3=new Item({
  name:"<-- Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];



const listSchema= new mongoose.Schema({
  name:String,
  item:[itemsSchema]
});


const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {

  //read document,
  Item.find({}, (err, items) => {
    if(items.length === 0){

      // send documents to collection(items),
      Item.insertMany(defaultItems, (error) => {
        if (error){
          console.log(error);
        }else{
          console.log("Sucessfully inserted default items to DB.");
        }
      });

      res.redirect("/");

    }else{

      if(err){
        console.log(err);
      }else{
        res.render("list", {listTitle: "Today",  newListItems: items});
      }

    }

  });

});

app.post("/", (req, res) => {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  //create New document,
  const item= new Item({
    name:itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");

  } else {
    List.findOne({name:listName}, (err, list) =>{
      list.item.push(item);
      list.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", (req, res) => {
  const checkedItemId=req.body.checkBox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.deleteOne({_id:checkedItemId}, (err) =>{
      if(err){
        console.log(err);
      }else{
        console.log("Sucessfully deleted an item");
        res.redirect("/");
      }

    });

  }else{
    List.findOneAndUpdate({name:listName}, {$pull: {item: {_id:checkedItemId}}}, (err, list) => {
      if(!err){
        res.redirect("/" + listName);
      }
    });

  }

});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName}, (err, list) => {
    if(!err){
      if(!list){
        //create a new list,
        const list = new List({
          name:customListName,
          item:defaultItems
        });
        list.save();
        res.redirect("/"+ customListName);
      }else{
        res.render("list", {listTitle:list.name, newListItems:list.item});
      }

    }else{
      console.log(err);
    }

  });


});

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
