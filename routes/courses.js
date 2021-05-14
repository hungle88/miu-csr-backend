const { ObjectID } = require("bson");
const express = require("express");
const env = require("dotenv").config();
const course_collection = process.env.COURSESCOLLECTION;
const student_collection = process.env.STUDENTSCOLLECTION;
const router = express.Router();

//http://localhost:4000/api/v1/courses GET//////
router.get("/", (req, res) => {
  req.db
    .collection(course_collection)
    .find()
    .toArray()
    .then((doc) => {
      res.json({ status: "success", result: doc });
    })
    .catch((err) => {
      res.json({ status: "fail" });
    });
});

//http://localhost:4000/api/v1/courses/:id/posts/students GET//////
router.get("/:id/posts/students", (req, res) => {
  req.db
    .collection(course_collection)
    .findOne({ _id: new ObjectID(req.params.id) }, { projection: { posts: 1 } })
    .then((doc) => {
      if (doc) {
        res.json({ status: "success", result: doc });
      } else {
        res.json({ status: "fail" });
      }
    })
    .catch((err) => {
      res.json({ status: "fail" });
    });
});

//http://localhost:4000/api/v1/courses/posts POST
router.post("/posts", (req, res) => {
  req.db
    .collection(course_collection)
    .findOne({ coursesName: req.body.currentCourse })
    .then((doc) => {
      //console.log(doc)
      if (doc) {
        const student = doc.students.find((student) => {
          return student._id == req._id;
        });
        if (student) {
          const date = new Date();
          const post = {
            _id: ObjectID(),
            student_id: student._id,
            created_date:
              date.getMonth() +
              1 +
              "-" +
              date.getDate() +
              "-" +
              date.getFullYear(),
            studentFullName: student.firstName + " " + student.lastName,
            currentCourse: req.body.currentCourse,
            desiredCourse: req.body.desiredCourse,
            message: req.body.message,
            status: "incomplete",
          };
          req.db
            .collection(course_collection)
            .updateOne({ _id: doc._id }, { $push: { posts: post } })
            .then((doc) => {
              if (doc) {
                res.json({ status: "success", result: post._id });
              }
            })
            .catch((err) => {
              res.json({ status: "fail1" });
            });
        } else {
          res.json({ status: "fail2" });
        }
      }
    })
    .catch((err) => {
      res.json({ status: "fail" });
    });
});

//http://localhost:4000/api/v1/courses/posts/:id DELETE
router.delete("/posts/:id", (req, res) => {
  req.db
    .collection(course_collection)
    .updateOne(
      { "posts._id": new ObjectID(req.params.id), "posts.student_id": req._id },
      { $pull: { posts: { _id: new ObjectID(req.params.id) } } }
    )
    .then((doc) => {
      console.log("doc........", doc);
      res.json({ status: "success" });
    })
    .catch((err) => {
      res.json({ status: "fail" });
    });
});

//http://localhost:4000/api/v1/courses/post/:id PUT
router.put("/posts/:id", (req, res) => {
  req.db
    .collection(course_collection)
    .updateOne(
      { "posts._id": new ObjectID(req.params.id), "posts.student_id": req._id },
      {
        $set: {
          "posts.$.currentCourse": req.body.currentCourse,
          "posts.$.desiredCourse": req.body.desiredCourse,
          "posts.$.message": req.body.message,
        },
      }
    )
    .then((doc) => {
      res.json({ status: "success" });
    })
    .catch((err) => {
      res.json({ status: "fail" });
    });
});

//fetch all request from everyone
//http://localhost:4000/api/v1/courses/posts/latest GET

router.get("/posts/latest", (req, res) => {
  req.db
    .collection(course_collection)
    .aggregate([
      { $unwind: "$posts" },
      { $sort: { "posts.created_date": -1 } },

      { $match: { "posts.status": "incomplete" } },

      { $group: { _id: "$studentFullName", posts: { $push: "$posts" } } },
    ])
    .sort({ created_date: -1 })
    .toArray(function (err, data) {
      if (err) throw err;
      console.log(req.params.item);
      data.forEach((todo) => console.log(todo));
      res.json(data);
    });
});

//fetch one student's requests
//http://localhost:4000/api/v1/courses/students/:id GET

router.get("/students/:id", (req, res) => {
  req.db
    .collection(course_collection)
    .aggregate([
      { $unwind: "$posts" },
      { $sort: { "posts.created_date": -1 } },

      {
        $match: {
          "posts.student_id": req.params.id,
          "posts.status": "incomplete",
        },
      },

      { $group: { _id: "$studentFullName", posts: { $push: "$posts" } } },
    ])
    .sort({ created_date: -1 })
    .toArray(function (err, data) {
      if (err) throw err;
      // console.log(req.params.item);
      data.forEach((todo) => console.log(todo));
      res.json(data);
    });
});

//http://localhost:4000/api/v1/courses/posts/status/:id PUT
router.put("/posts/status/:id", (req, res) => {
  req.db
    .collection(course_collection)
    .updateOne(
      { "posts._id": new ObjectID(req.params.id), "posts.student_id": req._id },
      {
        $set: {
          "posts.$.status": "complete",
        },
      }
    )
    .then((doc) => {
      res.json({ status: "success" });
    })
    .catch((err) => {
      res.json({ status: "fail" });
    });
});

module.exports = router;
