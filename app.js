import express from "express";
import bodyParser from "body-parser";
import _ from "lodash";
import mongoose from "mongoose";
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/BlogDB");
const articleSchema = new mongoose.Schema({
    page: String,
    title: {
        type: String,
        required: [true, "Please check your data entry, no title specified!"],
    },
    content: {
        type: String,
        required: [true, "Please check your data entry, no content specified!"],
    },
    posts: Array,
});
const Article = mongoose.model("article", articleSchema);
Article.findOne({ title: "home" }).exec((err, result) => {
    if (err) {
        console.log(err);
    }
    if (result) {
        console.log("Home already exists");
    }
    else {
        const initialContent = [
            {
                page: "home",
                title: "home",
                content: "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.",
                posts: [],
            },
            {
                page: "about",
                title: "about",
                content: "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.",
            },
            {
                page: "contact",
                title: "contact",
                content: "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.",
            },
        ];
        Article.insertMany(initialContent)
            .then((result) => {
            console.log(result);
        })
            .catch((err) => {
            console.log(err);
        });
    }
});
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
async function handlingGetRequest(page, req, res) {
    try {
        const result = await Article.find({ page: page });
        if (page === "home") {
            res.render("home", { homeDetail: result[0].content, posts: result[0].posts });
        }
        else if (page === "about") {
            res.render("about", { aboutDetail: result[0].content });
        }
        else if (page === "contact") {
            res.render("contact", { contactContent: result[0].content });
        }
    }
    catch (err) {
        console.log(err);
    }
}
async function handlingPostRequest(page, req, res, newPost) {
    try {
        const query = await Article.findOneAndUpdate({ page: page }, { $push: { posts: newPost } });
        console.log(query);
        res.redirect("/");
    }
    catch (err) {
        console.log(err);
    }
}
app.get("/", (_req, res) => {
    handlingGetRequest("home", _req, res);
});
app.get("/about", (req, res) => {
    handlingGetRequest("about", req, res);
});
app.get("/contact", (req, res) => {
    handlingGetRequest("contact", req, res);
});
app.get("/compose", (req, res) => {
    res.render("compose");
});
app.get("/posts/:title", async (req, res) => {
    const postTitle = _.lowerCase(req.params.title);
    try {
        const query = await Article.findOne({ page: "home" }, { posts: 1 });
        query?.posts.forEach((post) => {
            if (_.lowerCase(post.title) === postTitle) {
                console.log(post);
                res.render("post", { post: post });
            }
        });
    }
    catch (err) {
        console.log(err);
    }
});
app.post("/", (req, res) => {
    const newPost = {
        description: req.body.post,
        title: req.body.title,
    };
    handlingPostRequest("home", req, res, newPost);
});
app.post("/posts", async (req, res) => {
    console.log(_.lowerCase(req.body.deleteButton));
    try {
        const query = await Article.findOneAndUpdate({ page: "home" }, { $pull: { posts: { title: req.body.deleteButton } } }, { new: true });
        console.log(query);
        res.redirect("/");
    }
    catch (err) {
        console.log(err);
    }
});
app.listen(3000, function () {
    console.log("Server started on port 3000");
});
