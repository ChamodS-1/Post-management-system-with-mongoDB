const path = require('path');
const fs = require('fs');

const express = require('express');
const app = express();

const mongodb = require('mongodb');
const ObjectId = mongodb.ObjectId;

const db = require('./database/database');
 

app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')


app.get('/blog-home', function (req, res) {

    res.render('main');

});

app.get('/create-post', async(req, res) => {

        const documents =   await db.DbConn().collection('author').find().toArray();
        res.render('post',{documents:documents});
});

app.post('/create-post',  async (req, res)=> {

    const authorid = new ObjectId(req.body.select);

    const authorDetails = await db.DbConn().collection('author').findOne({_id : authorid})

    const newPost = {
        title : req.body.titlepost,
        summary : req.body.titlesummery,
        postcontent : req.body.postcontent,
        date : new Date().toDateString(),
        author : {
            authorID : authorid,
            authName : authorDetails.name,
            authEmail : authorDetails.email
        }
    }

    const postResults =  await db.DbConn().collection('posts').insertOne(newPost);
    res.redirect('/success');

});

app.get('/success', function (req, res) {

    res.render('successful');

});

app.get('/updated', function (req, res) {

    res.render('updated');

});

app.get('/deleted', function (req, res) {

    res.render('deleted');

});

app.get('/all-post',  async(req, res) => {

    const allPosts =  await db.DbConn().collection('posts').find().toArray();
    res.render('allpost',{allPosts:allPosts,length:allPosts.length});

});

app.get('/all-post/:id',  async(req, res) => {

   const postID = new ObjectId(req.params.id);
   const result =  await db.DbConn().collection('posts').find({_id : postID}).toArray();

        res.render('viwpost', { result: result });
  
});


app.get('/edite/:id', async (req, res)=>{

   const editepostID = new ObjectId(req.params.id);
   const result =  await db.DbConn().collection('posts').find({_id : editepostID}).toArray();

        res.render('edite', { keys: result });

  

});

app.post('/edite/:id', async (req, res) => {

    const updatedPost = {

        title : req.body.titlepost,
        summary : req.body.titlesummery,
        postcontent : req.body.postcontent,
        date : new Date().toDateString(),

    }

    const updatepostID = new ObjectId(req.params.id);
    try{
        const result =  await db.DbConn().collection('posts').updateOne({_id : updatepostID}, {$set : updatedPost});
        res.redirect('/updated');
    }catch(e){
        console.log(e.message);
    }

});

app.get('/delete/:id', async (req, res) => {
    const deletepostID = new ObjectId(req.params.id);

    try{
        const result =  await db.DbConn().collection('posts').deleteOne({_id : deletepostID});
        res.redirect('/deleted');
    }catch(e){
        console.log(e.message);
    }



  

});


app.use(function (req, res) {

    res.render('404');

});

db.connectTo().then(() => {
    app.listen(4000);
}).catch((err) => console.log(err.message));

