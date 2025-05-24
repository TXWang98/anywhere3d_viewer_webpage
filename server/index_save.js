var http = require("http");
var https = require("https");
var fs = require("fs");
var path = require("path");
var bodyParser = require("body-parser");
var request = require("request");
const querystring = require('querystring');
var compression = require('compression');
var express = require("express");
var async = require('async');
const util = require('util');
const url = require("url");

var app = express();
var router = express.Router();

var config = require(path.join(__dirname, "/Config.js"));

const MongoClient = require("mongodb").MongoClient
const ObjectId = require("mongodb").ObjectID;
const DB_URL = 'mongodb://127.0.0.1:27017';
let DB_NAME = 'sqa3d';
let Object_DB_collection = 'ScanNet_objects_full';
let Task_DB_collection = 'SQA3D_tasks';

var session = require('client-sessions');

app.use(session({
	cookieName: 'session',
	secret: process.env.SESSION_SECRET,
	duration: 5 * 60 * 60 * 1000,
	activeDuration: 3 *30 * 60 * 1000
}));



app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(bodyParser.json({
	limit: '50mb',
	type: 'application/json'
}));

app.use(compression());

app.use(express.static(path.join(__dirname, "/static")));
app.use(express.static(path.join(__dirname, "/../client")));
app.use(express.static(path.join(__dirname, "/../node_modules")));
app.use(express.static(path.join(__dirname, "/../resources")));



app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));


const scannet = new Object();
// scannet.scansv1 = "static/ScanNetV1/scans/";
// scannet.scansv1 = "static/ScanNetV2/scans/";
scannet.scans = "static/ScanNetV2/scans/";
scannet.objects = "static/ScanNetV2/objects/";
// scannet.frames = "static/ScanNetV2/ScanNet_frames/";
// scannet.previews = "static/ScanNetV2/ScanNet_previews/";
// scannet.galleries = "static/ScanNetV2/ScanNet_galleries/";
// scannet.annotation_batch = "static/annotation_batch.json"
const scene_list_file = fs.readFileSync("static/meta/ScanRefer_filtered.txt", "utf-8")
const scene_list = scene_list_file.split("\n")
const credential = JSON.parse(fs.readFileSync("static/credential.json"));

function organize_data(data) {
	organized = new Object();
	for (let i = 0; i < data.length; i++) {
		scene_id = data[i]["scene_id"];
		object_id = data[i]["object_id"];
		object_name = data[i]["object_name"];
		ann_id = data[i]["ann_id"];

		if (!(scene_id in organized)) {
			organized[scene_id] = new Object();
		}

		if (!(object_id in organized[scene_id])) {
			organized[scene_id][object_id] = new Object();
		}

		if (!(ann_id in organized[scene_id][object_id])) {
			organized[scene_id][object_id][ann_id] = null;
		}

		organized[scene_id][object_id][ann_id] = data[i];
	}

	return organized
}

function append_head(message) {
	let stamp = new Date();
	let year = ""+stamp.getFullYear();
	let month = ""+(stamp.getMonth()+1);
	let date = ""+stamp.getDate();
	let hour = ""+stamp.getHours();
	let minute = ""+stamp.getMinutes();
	let second = ""+stamp.getSeconds();

	// format
	if (month.length < 2) month = "0" + month;
	if (date.length < 2) date = "0" + date;
	if (hour.length < 2) hour = "0" + hour;
	if (minute.length < 2) minute = "0" + minute;
	if (second.length < 2) second = "0" + second;

	let date_str = year+'-'+month+'-'+date;
	let time_str = hour+":"+minute+":"+second;
	let date_time = date_str+'_'+time_str;
	let head = "["+date_time+"]     ";

	return head+message;
}

// const scanrefer_data = organize_data(JSON.parse(fs.readFileSync("static/data/ScanRefer_filtered.json")))

/*************************************/
/********     Main Routes     ********/
/*************************************/

router.get("/main", function(req, res) {
	res.render("Main", {
		params: JSON.stringify({
			scene_list: scene_list
		})
	});
});

router.get("/error", function(req, res) {
	res.render("ErrorPage");
});

router.post("/login", function(req, res) {
	let username = req.body.username;
	let password = req.body.password;
	let status = password == credential[username];
	let response = {"status": status};
	console.log(append_head("login request from: "+username+", login status: "+status));
	res.json(response);
});

/*************************************/
/*********  Resource Routes  *********/
/*************************************/

router.get("/resource/refresh", function(req, res) {
	let routed = path.join(__dirname, "static", "refresh.ico");
	res.sendFile(routed);
});

router.get("/resource/camera", function(req, res) {
	let routed = path.join(__dirname, "static", "camera.ply");
	res.sendFile(routed);
});

router.get("/resource/mesh/:scene_id/:scene_mesh", function(req, res) {
	let routed = path.join(__dirname, scannet.scans, req.params.scene_id, req.params.scene_mesh);
	res.sendFile(routed);
});

router.get("/resource/object/:scene_id/:object_mesh", function(req, res) {
	let routed = path.join(__dirname, scannet.objects, req.params.scene_id, req.params.object_mesh);
	res.sendFile(routed);
});

router.get("/resource/aggr/:scene_id/:seg_aggr", function(req, res) {
	let routed = path.join(__dirname, scannet.scans, req.params.scene_id, req.params.seg_aggr);
	res.sendFile(routed);
});

router.get("/resource/seg/:scene_id/:seg_file", function(req, res) {
	let routed = path.join(__dirname, scannet.scans, req.params.scene_id, req.params.seg_file);
	res.sendFile(routed);
});

router.get("/resource/tutorial/:file", function(req, res) {
	let routed = path.join(__dirname, 'static', 'tutorial', req.params.file);
	res.sendFile(routed);
});

router.get("/resource/trans/:scene_id", function(req, res) {
	let routed = path.join('/media/robot/de4b4249-95b6-4a46-8aff-c981e9defe7b/', 'scans', req.params.scene_id, req.params.scene_id.concat('.txt'));
	res.sendFile(routed);
});

// // individual pose file
// router.get("/resource/pose/:scene_id/:pose_file", function(req, res) {
// 	let routed = path.join(__dirname, scannet.frames, req.params.scene_id, "pose", req.params.pose_file);
// 	res.sendFile(routed);
// });

// // aggregated pose file
// router.get("/resource/pose/:scene_id", function(req, res) {
// 	let routed = path.join(__dirname, scannet.frames, req.params.scene_id, "all_pose.json");
// 	res.sendFile(routed);
// });

// router.get("/resource/frame/:scene_id/:frame_file", function(req, res) {
// 	let routed = path.join(__dirname, scannet.frames, req.params.scene_id, "color", req.params.frame_file);
// 	res.sendFile(routed);
// });

// router.get("/resource/frame/reduced/:scene_id/:frame_file", function(req, res) {
// 	let routed = path.join(__dirname, scannet.frames, req.params.scene_id, "reduced", req.params.frame_file);
// 	res.sendFile(routed);
// });

// router.get("/resource/preview/:scene_id", function(req, res) {
// 	let routed = path.join(__dirname, scannet.previews, req.params.scene_id + "_vh_clean_2.png");
// 	res.sendFile(routed);
// });

// router.get("/resource/gallery/:scene_id", function(req, res) {
// 	let routed = path.join(__dirname, scannet.galleries, req.params.scene_id + ".json");
// 	res.sendFile(routed);
// });

router.get("/resource/instruction/:name", function(req, res) {
	let routed = path.join(__dirname, "static/instruction", req.params.name);
	res.sendFile(routed);
});

router.get("/resource/info/:name", function(req, res) {
	let routed = path.join(__dirname, "static/instruction", req.params.name);
	res.sendFile(routed);
});

/*************************************/
/*********  MeshViewer Routes  *********/
/*************************************/


//// WARNING: this call will close db_client
function render_scene_with_task(
	req,
	res,
	db_client,
	scene_id,
	sqa_db_collection_name,
	hash1,
	hash2,
	task_db,
	task_type,
	max_response,
	cur_response,
	agent_rot,
	agent_pos,
	situation,
	question,
	) {
	try {
		const db = db_client.db(DB_NAME);
		const select_collection = db.collection(Object_DB_collection);

		let async_tasks = [];
		let query = { scene_id: scene_id };
		let scene_object = [];

		async_tasks.push(function (callback) {
			select_collection.find(query).toArray(function (err, results) {
				console.assert(!err, "failed to acquire data");
				for (let i = 0; i < results.length; i++) {
					scene_object.push(results[i].object_id + "_" + results[i].object_name.split(" ").join("_") + ".ply");
				}
				scene_object.sort(function (a, b) {
					let x = parseInt(a.split("_")[0]);
					let y = parseInt(b.split("_")[0]);
					return x - y;
				});
				callback();
			});
		});
		async.parallel(async_tasks, function (err, results) {
			db_client.close();
			if (!err) {
				console.log(append_head("succeeded to query " + scene_object.length + " object selections in " + req.params.scene_id));
				let params = {
					scene_list: scene_list,
					scene_id: scene_id,
					scene_object: scene_object,
					sqa_db_collection_name: sqa_db_collection_name,
				};

				if (hash1) {
					params.hash1 = hash1;
				}
				if (hash2) {
					params.hash2 = hash2;
				}
				if (task_db) {
					params.task_db = task_db;
				}
				if (max_response) {
					params.max_response = max_response;
				}
				if (cur_response || cur_response === 0) {
					// FIXME: ignore cur_response
					// params.cur_response = cur_response;
					params.cur_response = 0;
				}
				if (task_type) {
					params.task_type = task_type;
				}
				if (agent_rot) {
					params.agent_rot = agent_rot;
				}
				if (agent_pos) {
					params.agent_pos = agent_pos;
				}
				if (situation) {
					params.situation = situation;
				}
				if (question) {
					params.question = question;
				}

				res.render("MeshViewer", {
					params: JSON.stringify(params)
				});
			}
			else {
				console.log(append_head("failed to query " + scene_object.data.length + " object selections in " + req.params.scene_id));
				res.sendStatus(503);
			}
		});
	}
	catch (err) {
		console.log(err);
		console.log(append_head("Invalid request, redirecting to error page..."));
		res.render("ErrorPage");
	}
}

router.get("/amthit/:extra", function(req, res) {
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		try {
			console.assert(!err, "failed to connect MongoDB client");
			let extra = new url.URLSearchParams(req.params.extra);
			let hash1 = extra.get("id");
			let task_db = extra.get("task_db");
			if (!task_db) {
				task_db = Task_DB_collection;
			}
			const db = client.db(DB_NAME);
			const select_collection = db.collection(task_db);

			let async_tasks = [];
			let query = {hash1: hash1};
			let task_info = new Object();

			async_tasks.push(function(callback) {
				select_collection.find(query).toArray(function(err, results) {
					console.assert(!err, "failed to acquire data");
					task_info = results[0];
					if (!task_info) {
						console.log("Failed to load task with hash1 " + hash1);
					}
					callback();
				});
			});
			async.parallel(async_tasks, function(err, results) {
				if (!err && task_info != undefined) {
					render_scene_with_task(
						req,
						res,
						client,
						task_info.scene_id,
						task_info.sqa_db_collection_name,
						task_info.hash1,
						task_info.hash2,
						task_info.task_db,
						task_info.task_type,
						task_info.max_response,
						task_info.cur_response,
						task_info.agent_rot,
						task_info.agent_pos,
						task_info.situation,
						task_info.question,
					);
				}
				else {
					console.log("Failed to load task with hash1 " + hash1);
					res.sendStatus(503);
				}
			});
		}
		catch (err) {
			console.log(err);
			console.log(append_head("Invalid request, redirecting to error page..."));
			res.render("ErrorPage");
		}
	});
});


router.get("/meshviewer/:extra", function(req, res) {
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		try {
			console.assert(!err, "failed to connect MongoDB client");
			let extra = new url.URLSearchParams(req.params.extra);
			let scene_id = extra.get("scene_id");
			let sqa_db_collection_name = extra.get("sqa_collection");

			render_scene_with_task(
				req,
				res,
				client,
				scene_id,
				sqa_db_collection_name,
			);
		}
		catch (err) {
			console.log(err);
			console.log(append_head("Invalid request, redirecting to error page..."));
			res.render("ErrorPage");
		}
	});
});


router.get("/sqachecker/:extra", function(req, res) {
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		try {
			console.assert(!err, "failed to connect MongoDB client");
			const db = client.db(DB_NAME);
			const select_collection = db.collection(Object_DB_collection);

			let async_tasks = [];
			let extra = new url.URLSearchParams(req.params.extra);
			let scene_id = extra.get("scene_id");
			let sqa_db_collection_name = extra.get("sqa_collection");
			let query = {scene_id: scene_id};
			let scene_object = [];

			async_tasks.push(function(callback) {
				select_collection.find(query).toArray(function(err, results) {
					console.assert(!err, "failed to acquire data");
					for (let i = 0; i < results.length; i++) {
						scene_object.push(results[i].object_id+"_"+results[i].object_name.split(" ").join("_")+".ply");
					}
					scene_object.sort(function(a, b) {
						let x = parseInt(a.split("_")[0]);
						let y = parseInt(b.split("_")[0]);
						return x - y;
					});
					callback();
				});
			});
			async.parallel(async_tasks, function(err, results) {
				client.close();
				if (!err) {
					console.log(append_head("succeeded to query "+scene_object.length+" object selections in "+scene_id));
					res.render("SQAChecker", {
						params: JSON.stringify({
							scene_list: scene_list,
							scene_id: scene_id,
							scene_object: scene_object,
							scannet: scannet,
							sqa_db_collection_name: sqa_db_collection_name,
						})
					});
				}
				else {
					console.log(append_head("failed to query "+return_data.data.length+" object selections in "+scene_id));
					res.sendStatus(503);
				}
			});
		}
		catch (err) {
			console.log(err);
			console.log(append_head("Invalid request, redirecting to error page..."));
			res.render("ErrorPage");
		}
	});
});


router.get("/tutorial", function(req, res) {
	try {
		res.render("Tutorial", {
			params: JSON.stringify({
				task_type: "",
			})
		});
	}
	catch (err) {
		console.log(err);
		console.log(append_head("Invalid request, redirecting to error page..."));
		res.render("ErrorPage");
	}
});

router.get("/tutorial1", function(req, res) {
	try {
		res.render("Tutorial", {
			params: JSON.stringify({
				task_type: "1",
			})
		});
	}
	catch (err) {
		console.log(err);
		console.log(append_head("Invalid request, redirecting to error page..."));
		res.render("ErrorPage");
	}
});

router.get("/tutorial2", function(req, res) {
	try {
		res.render("Tutorial", {
			params: JSON.stringify({
				task_type: "2",
			})
		});
	}
	catch (err) {
		console.log(err);
		console.log(append_head("Invalid request, redirecting to error page..."));
		res.render("ErrorPage");
	}
});

router.get("/tutorial3", function(req, res) {
	try {
		res.render("Tutorial", {
			params: JSON.stringify({
				task_type: "3",
			})
		});
	}
	catch (err) {
		console.log(err);
		console.log(append_head("Invalid request, redirecting to error page..."));
		res.render("ErrorPage");
	}
});

router.get("/tutorial4", function(req, res) {
	try {
		res.render("Tutorial", {
			params: JSON.stringify({
				task_type: "4",
			})
		});
	}
	catch (err) {
		console.log(err);
		console.log(append_head("Invalid request, redirecting to error page..."));
		res.render("ErrorPage");
	}
});

router.get("/tutorial5", function(req, res) {
	try {
		res.render("Tutorial", {
			params: JSON.stringify({
				task_type: "5",
			})
		});
	}
	catch (err) {
		console.log(err);
		console.log(append_head("Invalid request, redirecting to error page..."));
		res.render("ErrorPage");
	}
});




router.get("/database/status/:extra", function(req, res) {
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		try {
			console.assert(!err, "failed to connect MongoDB client");
			const db = client.db(DB_NAME);
			let extra = new url.URLSearchParams(req.params.extra);
			let collection = extra.get("collection");
			const select_collection = db.collection(collection);

			let async_tasks = [];
			let status = new Object();

			// scene_list.sort(function(a, b){
			// 	return ('' + a[1]).localeCompare(b[1]);
			// })
			scene_list.forEach((scene_id) => {
				async_tasks.push(function(callback) {
					let query = {scene_id: scene_id};
					select_collection.find(query).toArray(function(err, results) {
						console.assert(!err, "failed to acquire data");
						status[scene_id] = results.length;
						callback();
					});
				});
			});
			async.parallel(async_tasks, function(err, results) {
				client.close();
				if (!err) {
					console.log(append_head("succeeded to query status of collection "+collection));
					let ret = new Object();
					scene_list.forEach((scene_id) => {
						ret[scene_id] = status[scene_id];
					});
					res.status(200).send(ret);
				}
				else {
					console.log(append_head("failed to query status of collection "+collection));
					res.sendStatus(503);
				}
			});
		}
		catch (err) {
			console.log(err);
			console.log(append_head("Invalid request, redirecting to error page..."));
			res.render("ErrorPage");
		}
	});
});



/*************************************/
/*********  Database Routes  *********/
/*********      Mesh2cap     *********/
/*************************************/

// client connection check
router.get("/database/test", function(req, res) {
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		if (!err) {
			console.log(append_head("MongoDB client connected!"));
			client.close();
			res.sendStatus(200);
		}
		else {
			console.log(err);
			console.log(append_head("failed to connect MongoDB client"));
			res.sendStatus(503);
		}
	});
});

// save sqa3d annotations
router.post("/database/sqa3d/save/:extra", function(req, res) {
	let extra = new url.URLSearchParams(req.params.extra);
	let sqa_collection = extra.get("sqa_collection");
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		console.assert(!err, "failed to connect MongoDB client");
		const db = client.db(DB_NAME);
		const des_collection = db.collection(sqa_collection);
		let async_tasks = [];
		async_tasks.push(function(callback) {
			let query = {
				situation: req.body.situation,
				question: req.body.question,
				answer: req.body.answer,
				scene_id: req.body.scene_id
			}
			des_collection.find(query).toArray(function(err, results) {
				if (results.length != 0) {
					console.log("Duplicated data detected!");
					callback("Duplicated data detected!");
				}
				else {
					console.log(results);
					let obj = {
						// TBD(:jxma) commonsense or question type
						scene_id: req.body.scene_id,
						agent_pos: req.body.agent_pos,
						agent_rot: req.body.agent_rot,
						situation: req.body.situation,
						question: req.body.question,
						answer: req.body.answer,
						answer_confidence: req.body.answer_confidence,
						hash1: req.body.hash1,
						hash2: req.body.hash2,
						task_db: req.body.task_db,
						modified: false,
					};
					des_collection.insertOne(
						obj, function(err, result) {
							console.assert(!err, "failed to insert data");

							if (req.body.task_db) {
								// update task_db
								const task_collection = db.collection(req.body.task_db);
								let query = { hash1: req.body.hash1 };
								let new_val = { $inc: { cur_response: 1 } };
								task_collection.updateOne(query, new_val, function (err, res) {
									console.assert(!err, "failed to update data");
									callback();
								});
							}
							else {
								callback();
							}
						}
					);
				}

			});
		});
		async.parallel(async_tasks, function(err, results){
			client.close();
			if (!err) {
				console.log(append_head("succeeded to save SQA entry to collection "+sqa_collection+" scene_id:"+req.body.scene_id+"; agent_pos"+req.body.agent_pos+"; situation:"+req.body.situation+"; question:"+req.body.question+"; answer:"+req.body.answer+"; hash1:"+req.body.hash1+"; hash2:"+req.body.hash2));
				res.sendStatus(200);
			}
			else {
				console.log(append_head("failed to save SQA entry to collection "+sqa_collection+" scene_id:"+req.body.scene_id+"; agent_pos"+req.body.agent_pos+"; situation:"+req.body.situation+"; question:"+req.body.question+"; answer:"+req.body.answer+"; hash1:"+req.body.hash1+"; hash2:"+req.body.hash2));
				res.sendStatus(503);
			}
		});
	});
});

// load sqa3d annotations
router.post("/database/sqa3d/load/:extra", function(req, res) {
	let extra = new url.URLSearchParams(req.params.extra);
	let sqa_collection = extra.get("sqa_collection");
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		console.assert(!err, "failed to connect MongoDB client");
		const db = client.db(DB_NAME);
		const des_collection = db.collection(sqa_collection);
		let async_tasks = [];
		let scene_id = req.body.scene_id
		let query = {scene_id: scene_id};
		let sqas = new Object();

		async_tasks.push(function(callback) {
			des_collection.find(query).toArray(function(err, results) {
				console.assert(!err, "failed to acquire data");
				for (let i = 0; i < results.length; i++) {
					sqas[results[i]._id] = results[i];
				}
				callback();
			});
		});
		async.parallel(async_tasks, function(err, results){
			client.close();
			if (!err) {
				console.log(append_head("succeeded to load SQA entries from collection "+sqa_collection +" scene_id:"+req.body.scene_id+" number:"+Object.keys(sqas).length));
				res.status(200).send(sqas);
			}
			else {
				console.log(append_head("failed to load SQA entries from collection "+sqa_collection +"; scene_id:"+req.body.scene_id));
				res.sendStatus(503);
			}
		});
	});
});

// update sqa3d annotations
router.post("/database/sqa3d/update/:extra", function(req, res) {
	let extra = new url.URLSearchParams(req.params.extra);
	let sqa_collection = extra.get("sqa_collection");
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		console.assert(!err, "failed to connect MongoDB client");
		const db = client.db(DB_NAME);
		const des_collection = db.collection(sqa_collection);
		let async_tasks = [];
		let _id = req.body._id
		let query = {_id: new ObjectId(_id)};

		async_tasks.push(function(callback) {
			let obj = {
				// TBD(:jxma) commonsense or question type
				scene_id: req.body.scene_id,
				agent_pos: req.body.agent_pos,
				agent_rot: req.body.agent_rot,
				situation: req.body.situation,
				question: req.body.question,
				answer: req.body.answer,
				hash1: req.body.hash1,
				hash2: req.body.hash2,
				task_db: req.body.task_db,
				modified: false,
			};
			let new_val = { $set: obj };
			des_collection.updateOne(query, new_val, function(err, res) {
				console.assert(!err, "failed to update data");
				callback();
			});
		});
		async.parallel(async_tasks, function(err, results){
			client.close();
			if (!err) {
				console.log(append_head("succeeded to update an SQA entry to collection "+sqa_collection+" _id:"+req.body._id));
				res.sendStatus(200);
			}
			else {
				console.log(append_head("failed to update an SQA entry to collection "+sqa_collection+" _id:"+req.body._id));
				res.sendStatus(503);
			}
		});
	});
});

// update sqa3d task info
router.post("/database/sqa3d/update_task/:extra", function(req, res) {
	let extra = new url.URLSearchParams(req.params.extra);
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		console.assert(!err, "failed to connect MongoDB client");
		let task_db = extra.get("task_db");
		if (!task_db) {
			task_db = Task_DB_collection;
		}
		const db = client.db(DB_NAME);
		const des_collection = db.collection(task_db);

		let async_tasks = [];
		let query = {hash1: req.body.hash1};

		async_tasks.push(function(callback) {
			let obj = {
				cur_response: req.body.cur_response,
			};
			let new_val = { $set: obj };
			des_collection.updateOne(query, new_val, function(err, res) {
				console.assert(!err, "failed to update data");
				callback();
			});
		});
		async.parallel(async_tasks, function(err, results){
			client.close();
			if (!err) {
				console.log(append_head("succeeded to update an task entry with hash1 "+req.body.hash1+" and task_db "+task_db));
				res.sendStatus(200);
			}
			else {
				console.log(append_head("failed to update an task entry with hash1 "+req.body.hash1+" and task_db "+task_db));
				res.sendStatus(503);
			}
		});
	});
});

// delete sqa3d annotations
router.post("/database/sqa3d/delete/:extra", function(req, res) {
	let extra = new url.URLSearchParams(req.params.extra);
	let sqa_collection = extra.get("sqa_collection");
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		console.assert(!err, "failed to connect MongoDB client");
		const db = client.db(DB_NAME);
		const des_collection = db.collection(sqa_collection);
		let async_tasks = [];
		let _id = req.body._id
		let query = {_id: new ObjectId(_id)};

		async_tasks.push(function(callback) {
			des_collection.deleteOne(query, function(err, res) {
				console.assert(!err, "failed to delete data");
				callback();
			});
		});
		async.parallel(async_tasks, function(err, results){
			client.close();
			if (!err) {
				console.log(append_head("succeeded to delete an SQA entry from collection "+sqa_collection+" _id:"+req.body._id));
				res.sendStatus(200);
			}
			else {
				console.log(append_head("failed to delete an SQA entry from collection "+sqa_collection+" _id:"+req.body._id));
				res.sendStatus(503);
			}
		});
	});
});


// load & save for a only
// just reuse load with hash

/*************************************/
/*********   Start Service   *********/
/*************************************/


app.use(config.base_url, router);
module.exports = router;

let async0 = new Promise((resolve, reject) => {
	resolve();
});


Promise.all([async0]).then(res => {
	const server = http.createServer(app).listen(config.http_port, function() {
	// const opt = {
	//	key: fs.readFileSync("cert/char.vc.in.tum.de.key"),
	//	cert: fs.readFileSync("cert/char.vc.in.tum.de.cert")
	// };
	// const server = https.createServer(opt, app).listen(config.http_port, function() {
		const host = server.address().address;
		const port = server.address().port;
		console.log("Example app listening at address http://%s in port: %s", host, port);
		// console.log("Example app listening at address https://%s in port: %s", host, port);
	});
});
