import React from 'react';
import ReactDOM from 'react-dom';
import RootUI from './view/RootUI';
import ViewUI from "./view/ViewUI";
import WindowManager from "../Common/WindowManager"
import ControlContent from './view/ControlContent'
import InfoContent from './view/InfoContent'
import Stats from "../../lib/utils/stats.min.js";
import * as utils from "../Common/utils";
import * as nyuv2 from "../Common/NYUv2_colors";
import * as THREE from 'three/build/three';
import * as path from "path";
import { ObjectControls } from '../../lib/controls/ObjectControls.js';
import { POINT_CONVERSION_COMPRESSED } from 'constants';
import { DragControls } from '../../lib/controls/DragControls_new.js';
import { thresholdScott } from 'd3';
import { assert } from 'console';


window.THREE = THREE;

class MeshViewer {

	init(params) {
		//console.log("calling initial!~!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
		this.draw_div();

		// setup resources
		this.get_resource(params);

		// setup container
		this.label_container = document.getElementById("label_container");

		// setup button
		this.btn = new Object();
		this.btn.none = document.getElementById("btn_none");
		this.btn.surface = document.getElementById("btn_surface");
		this.btn.control = document.getElementById("control_helper");

		this.add_listener(this.btn.none, "click", this.on_click_btn_none);
		this.add_listener(this.btn.surface, "click", this.on_click_btn_surface);
		this.add_listener(this.btn.control, "click", this.on_click_btn_control);
		window.addEventListener("keydown", this.on_keydown.bind(this));
		window.addEventListener("keyup", this.on_keyup.bind(this));

		// setup window mesh
		this.window_mesh = new WindowManager("canvas_container", "canvas");
		this.window_mesh.init();
		this.attach_listener();

		// setup scene
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0xffffff);

		// renderer
		this.context = this.window_mesh.canvas.getContext("webgl2", { preserveDrawingBuffer: true });
		this.renderer = new THREE.WebGLRenderer({ canvas: this.window_mesh.canvas, context: this.context, preserveDrawingBuffer: true });
		this.renderer.setSize(this.window_mesh.window_width, this.window_mesh.window_height);

		// raycaster
		this.raycaster = new THREE.Raycaster();
		this.intersected = null;

		// loading bar
		this.loading_bar = document.getElementById("loading_bar");
		this.loading_bar.style.width = "10%";
		

		//console.log('scenegraph coming !!!!!!!!!!!:')
		//console.log(this.scenegraph)

		fetch(path.join("/apps/resource/scenegraph/", this.resources.datasetname, this.resources.scene_id, this.resources.scenegraph)).then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok')
			}
			console.log("response", response)
			return response.json(); // 将响应解析为 JSON
		})
		.then(data => {
			this.scenegraph = data
			//console.log(this.scenegraph)
			//console.log('scenegraph coming !!!!!!!!!!!:')
			//console.log(this.scenegraph)
			// 在这里你可以对 data 进行处理，比如将数据传递给其他函数
		})
		.catch(error => {
			console.error('Error loading scenegraph JSON file:', error)
		})

		//console.log(this.scenegraph)



		fetch(path.join("/apps/resource/referring_expressions/", this.resources.datasetname, this.resources.scene_id, this.resources.referring_expressions)).then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok')
			}
			console.log("response", response)
			return response.json(); // 将响应解析为 JSON
		})
		.then(data => {
			this.all_referring_expressions = data
			//console.log(this.scenegraph)
			//console.log('scenegraph coming !!!!!!!!!!!:')
			//console.log(this.scenegraph)
			// 在这里你可以对 data 进行处理，比如将数据传递给其他函数
		})
		.catch(error => {
			console.error('Error loading referring expressions placeholder JSON file:', error)
		})





		fetch(path.join("/apps/resource/datasettype/", this.resources.datasetname, this.resources.datasettype)).then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok')
			}
			//console.log("response", response)
			return response.json(); // 将响应解析为 JSON
		})
		.then(data => {
			this.datasettype = data
			//console.log(this.datasettype)
			//console.log('datasettype coming !!!!!!!!!!!:')
			//console.log(this.scenegraph)
			// 在这里你可以对 data 进行处理，比如将数据传递给其他函数
		})
		.catch(error => {
			console.error('Error loading datasettype JSON file:', error)
		})

		//console.log("hahahahhahahahah", this.resources.sqa_db_collection_name)

		this.resources.sqa_db_collection_name = 'annotation_result'


		// primary promises for loading meshes
		let promises = [
			window.load_ply_file(path.join("/apps/resource/mesh/", this.resources.datasetname, this.resources.scene_id, this.resources.scene_mesh)),
			window.load_ply_file("/apps/resource/camera"),
			
			// window.load_ply_file("https://sqascannetviz.s3.us-west-1.amazonaws.com/scans/" + this.resources.scene_id + "/" + this.resources.scene_mesh),
			// window.load_ply_file("https://sqascannetviz.s3.us-west-1.amazonaws.com/camera.ply")
		];

		for (let i = 0; i < this.resources.scene_object.length; i++) {
			promises.push(
				window.load_ply_file(path.join("/apps/resource/object/", this.resources.datasetname, this.resources.scene_id, this.resources.scene_object[i]))
				// window.load_ply_file("https://sqascannetviz.s3.us-west-1.amazonaws.com/ScanNet_objects/" + this.resources.scene_id + "/" + this.resources.scene_object[i])
			)
		}
		this.loading_bar.style.width = "15%";
		Promise.all(promises).then(values => {
			// unpack data
			this.scene_geometry = values[0];
			this.scene_geometry.computeVertexNormals();
			this.scene_geometry.computeBoundingSphere();
			this.scene_geometry_center = this.get_object_center(this.scene_geometry);
			//console.log("this.scene_geometry.boundingSphere.min.z", this.scene_geometry.boundingBox.min)
			this.scene_geometry_min_z = this.scene_geometry.boundingBox.min.z
			this.camera_geometry = values[1];
			this.camera_geometry.computeVertexNormals();
			this.object_geometry = new Array();
			for (let i = 0; i < this.resources.scene_object.length; i++) {
				this.object_geometry.push(values[i + 2]);
				// this.object_geometry[i].name = this.resources.scene_object_id[i]+"_"+this.resources.scene_object_name[i];
				this.object_geometry[i].name = this.resources.scene_object_name[i];
				// console.log(this.object_geometry[i].name)
				this.object_geometry[i].computeVertexNormals();
			}
			this.loading_bar.style.width = "35%";
			// console.log(this.geometry);

			////////////////////////////////////////////////
			// // scene select
			// this.select = new Object();
			// this.select.scene = document.getElementById("scene_select");
			// this.scene_list = params.scene_list;

			// S & Q & A input boxes


			////////////////////////////////////////////////

			let new_promises = [
				// window.xhr_json("GET", path.join("/apps/resource/pose/", this.resources.scene_id)),
				// window.xhr_json("GET", path.join("/apps/resource/gallery/", this.resources.scene_id))
			];
			// for (let i = 0; i < this.indices.length; i++) {
			// 	new_promises.push(window.load_matrix(path.join("/apps/resource/pose/", this.resources.scene_id, this.indices[i] + ".txt")));
			// }
			this.loading_bar.style.width = "45%";
			Promise.all(new_promises).then(new_values => {
				// unpack data
				// this.poses = this.parse_pose(new_values[0]);
				// this.object_gallery = new_values[1];
				// randomly pick every 10 frames
				// this.interval = 10;
				// this.indices = this.get_frame_indices();
				// this.loading_bar.style.width = "55%";

				// Lights
				this.add_mesh(this.scene, [new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6)]);
				this.add_mesh(this.scene, [this.window_mesh.camera]);
				this.add_mesh(this.window_mesh.camera, [new THREE.PointLight(0xffffff, 0.5)]);
				this.loading_bar.style.width = "65%";



				////////////////////--------------------------------------------------------////////////////
				///////////////////       Adding 3D bounding box into scene                 ////////////////
				///////////// 一开始bounding box是在arrow后面加的，但是因为bounding box       ////////////////
				////////////  使用的材料是linebasicmaterial，没有emissive.getHex()属性       /////////////////
				///////////   会和后面的get_intersection()冲突；使用其他material，会使得     /////////////////
				///////////   bounding box的颜色是黑色，和场景以及物体不好区分；因此只能使用   /////////////////
				///////////   linebasicmaterial，为了避免get_intersection中linebasicmaterial ////////////////
				//////////    没有emissive.getHex()属性，把bounding box放在前面加入场景，     ////////////////
				/////////     只会对加入场景中的第四个开始调用get_intersection，从而避免了    //////////////////
				////////      bounding_box的linematerial没有get_hex属性                     ////////////////
				////////////////////--------------------------------------------------------////////////////
				
				
				//console.log("Z 坐标范围: ", this.scene_geometry.boundingBox.min.z, "到", this.scene_geometry.boundingBox.max.z)

				//console.log("Z 坐标范围: ", this.scene.boundingBox.min.z, "到", this.scene.boundingBox.max.z)

				/*
				var boundingbox_Pos = new THREE.Vector3();
				boundingbox_Pos.copy(new THREE.Vector3(
					0,
					0,
					// arrow height
					0));
				*/
				
				const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.5, 0.5, 0.5));
				const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, opacity: 0.65, transparent: true, linewidth:4});
				this.bounding_box = new THREE.LineSegments(edges, lineMaterial);

				//console.log("bounding box 坐标范围: ", this.bounding_box)

				
				//console.log("hello", this.bounding_box.position)
				this.add_mesh(this.scene, [this.bounding_box])
				this.bounding_box.position.set(0, 0, 0);

				this.bounding_box.geometry.computeBoundingBox();

				console.log("bounding box 坐标范围: ", this.bounding_box.geometry.boundingBox.max, this.bounding_box.geometry.boundingBox.min)

				this.bounding_box_width = 0.5
				this.bounding_box_length = 0.5
				this.bounding_box_height = 0.5
				this.bounding_box_rotation_angle = 0

				this.bounding_box_bar_x = 0
				this.bounding_box_bar_y = 0
				this.bounding_box_bar_z = 0


				this.bounding_box_dragControls = new DragControls([this.bounding_box], this.window_mesh.camera, this.renderer.domElement);
				

				/*this.arrow_drag_controls.addEventListener('drag', (event) => {
					console.log(event)
					if (this.arrow_dragging) {
						this.arrow.position.z = -z1;
						this.center_camera();
						// console.log(this.window_mesh.camera.up);
						// console.log(this.window_mesh.camera.position);
					}
				})*/
			
				
				this.bounding_box_dragControls.addEventListener('dragstart', (event) => {
					//console.log(this.bounding_box.material)
					//console.log(event.object)
					//console.log("moving bounding box starts", event.object, this.bounding_box.position)
					this.bounding_box.material.opacity = 0.5;
					
					//this.bounding_box.material.opacity = 0.5;
				});
				
				this.bounding_box_dragControls.addEventListener('dragend', (event) => {
					//console.log("moving bounding box ends", this.bounding_box.position)
					this.bounding_box.material.opacity = 1;
					document.getElementById('bounding_box_center_x_position').value = 0;
					document.getElementById('bounding_box_center_y_position').value = 0;
					document.getElementById('bounding_box_center_z_position').value = 0;
					this.bounding_box_bar_x = 0
					this.bounding_box_bar_y = 0
					this.bounding_box_bar_z = 0
				// 重新启用拖拽功能
				// 	//this.bounding_box_dragControls.enabled = true;
				});
				
				//this.window_mesh.add_listener('mouseup', this.enable_boundingboxcontrol);
				// 监听 mouseup 事件以重新启用拖拽控制
				//this.window_mesh.addEventListener('mouseup', () => {
				//	this.bounding_box_dragControls.enabled = true;
				//});

				//this.save_bounding_box_pos = new THREE.Vector3(0, 0 ,0)
				//this.save_bounding_box_pos.copy(this.bounding_box.position)

				/////////////////////////////////////////////////////////////////////////////////////
				//////////////////  Adding 3D bounding box into scene ends   //////////////////////// 
				/////////////////////////////////////////////////////////////////////////////////////



				// setup scene background mesh
				this.scene_mesh = this.set_mesh(
					this.scene_geometry,
					new THREE.MeshStandardMaterial({ vertexColors: THREE.VertexColors, metalness: 0.0 })
				);
				//console.log("after convert, scene geometry center, bounding box min", this.scene_geometry.boundingBox.min)
				//console.log("after convert, scene geometry center, bounding box max", this.scene_geometry.boundingBox.max)

				this.add_mesh(this.scene, [this.scene_mesh]);
				this.loading_bar.style.width = "85%";

				//his.scene_mesh.geometry.computeBoundingBox();

				console.log("Z 坐标范围: ", this.scene_geometry.boundingBox.min.z, "到", this.scene_geometry.boundingBox.max.z)

				// indexing the mesh view
				// {0: none, 1: surface, 2: instance}
				this.mesh_view = 1;
				this.instance_id = -1;
				this.selected_id = "-1";
				this.annotation_info = new Object();

				// setup the vitual camera
				this.camera_flag = false;

				////////////////////////////////////////////////////////////////////
				// add agent (arrow)


				
				var Pos = new THREE.Vector3();
				Pos.copy(new THREE.Vector3(
					0,
					0,
					// arrow height
					0));
				const geometry = new THREE.CylinderGeometry(0.1, 0.2, 0.5, 32);
				const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.65, transparent: true});

				this.cylinder = new THREE.Mesh(geometry, material);
				this.cylinder.position.set(Pos.x, Pos.y, Pos.z);
				this.cylinder.rotation.z = Math.PI / 2;

				const conegeo = new THREE.ConeGeometry(0.2, 0.3, 32);
				this.cone = new THREE.Mesh(conegeo, material);
				this.cone.position.set(Pos.x - 0.3, Pos.y, Pos.z);
				this.cone.rotation.z = Math.PI / 2;

				//create a group and add the two cubes
				//These cubes can now be rotated / scaled etc as a group
				this.arrow = new THREE.Group();
				this.arrow.add(this.cylinder);
				this.arrow.add(this.cone);
				var box = new THREE.Box3();
				box.expandByObject(this.arrow);
				var mdlen = box.max.x - box.min.x;
				var mdwid = box.max.z - box.min.z;
				var mdhei = box.max.y - box.min.y;
				// var centerpoint = new THREE.Vector3();
				var x1 = box.min.x + mdlen / 2;
				var y1 = box.min.y + mdhei / 2;
				var z1 = box.min.z + mdwid / 2;
				//console.log(box)
				this.arrow.position.set(-x1, -y1, -z1);
				//this.add_mesh(this.scene, [this.arrow])

				// initialize the arrow to be outside the scene
				var scene_box = new THREE.Box3();
				scene_box.expandByObject(this.scene_mesh);
				var mdlen = scene_box.max.x - scene_box.min.x;
				var mdwid = scene_box.max.y - scene_box.min.y;
				var offset = Math.max(mdlen, mdwid);
				this.arrow.position.x -= 0.4 * offset;
				this.arrow.position.y -= 0.2 * offset;

				// set arrow control
				this.arrow_controls = new ObjectControls(this.arrow, this.renderer.domElement);
				this.arrow_controls.movementSpeed = 1;
				this.arrow_controls.noFly = true;
				this.arrow_controls.constrainVertical = true; //约束垂直
				this.arrow_controls.verticalMin = 1.0;
				this.arrow_controls.verticalMax = 2.0;
				this.arrow_controls.lon = -100;
				this.arrow_controls.lat = 0;

				// set arrow drag control
				this.arrow_drag_controls = new DragControls([this.arrow], this.window_mesh.camera, this.renderer.domElement);
				this.arrow_drag_controls.transformGroup = true;
				this.arrowdragmouse = new THREE.Vector2();
				this.enableSelection = false;
				//console.log(this.arrow_dragging)
				this.arrow_drag_controls.addEventListener('drag', (event) => {
					//console.log(event)
					//console.log(event.button)
					//console.log(this.arrow_dragging)
					if (this.arrow_dragging) {
						this.arrow.position.z = -z1;
						this.center_camera();
						// console.log(this.window_mesh.camera.up);
						// console.log(this.window_mesh.camera.position);
					}
				})
				this.arrow_dragging = false;
				this.arrow_drag_controls.addEventListener('hoveron', (event) => {
					this.arrow_dragging = true;
				})
				this.arrow_drag_controls.addEventListener('hoveroff', (event) => {
					this.arrow_dragging = false;
				})
				document.getElementById('canvas_container').addEventListener('click', this.onArrowDragClick);
				// this.arrow_drag_controls.enabled = false;

				// set pos
				// this.arrow.setRotationFromQuaternion(this.arrow.quaternion);
				// var pos = THREE.Vector3();
				// pos = this.arrow.getWorldPosition(pos);
				// this.arrow.position.set(pos.x+1.0, pos.y, pos.z);
				////////////////////////////////////////////////////////////////////

				


				
				//////////////////////--------------------------------////////////////////////
				//////////////////////       Adding axeshelper        ////////////////////////
				//////////////////////--------------------------------////////////////////////

				//this.axesHelper = new THREE.AxesHelper(5); // 参数为坐标系的长度
				//this.axesHelper.material.emissive.set(0x000000)
				//this.add_mesh(this.scene, [this.axesHelper])


				this.axes_exist = 0

				



				//////////////////////--------------------------------////////////////////////
				//////////////////////     Adding axeshelper end      ////////////////////////
				//////////////////////--------------------------------////////////////////////






				//////////////////////--------------------------------////////////////////////
				//////////////////////       Adding Scale_cylinder        //////////////////////
				//////////////////////--------------------------------////////////////////////

				
				const scale_cylinderGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 32);
				const scale_cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 }); // 红色
				this.scale_cylinder = new THREE.Mesh(scale_cylinderGeometry, scale_cylinderMaterial);
				this.scale_cylinder.position.set(0, 0, 0); 
				this.scale_cylinder.rotation.z = 0
				this.add_mesh(this.scene, [this.scale_cylinder])
				this.scale_cylinder_dragControls = new DragControls([this.scale_cylinder], this.window_mesh.camera, this.renderer.domElement);
				this.scale_cylinder_dragControls.addEventListener('dragstart', (event) => {
					//console.log("moving cylinder starts", event.object)
					this.scale_cylinder.material.opacity = 0.5;
				});
				this.scale_cylinder_dragControls.addEventListener('dragend', (event) => {
					//console.log("moving cylinder ends")
					this.scale_cylinder.material.opacity = 1;
				});


				

				this.scale_cylinder_exist = 1




				//////////////////////--------------------------------////////////////////////
				//////////////////////     Adding Scale_cylinder end    ////////////////////////
				//////////////////////--------------------------------////////////////////////


				
				

				//console.log("hello", this.centerSphere.position)
				//this.add_mesh(this.scene, [this.centerSphere])

				//console.log("hello", this.cubeEdges.position)
				//this.add_mesh(this.scene, [this.cubeEdges])

				/*
				this.bounding_box_dragControls = new DragControls([this.bounding_box], this.window_mesh.camera, this.renderer.domElement);
				this.bounding_box_dragControls.addEventListener('dragstart', function (event) {
					event.object.material.opacity = 0.5;
				});
				this.bounding_box_dragControls.addEventListener('dragend', function (event) {
					event.object.material.opacity = 1;
				});
				*/
				

				//this.record = document.addEventListener('DOMContentLoaded',())
				//console.log(this.record)
				//document.getElementById('bounding_box_width').addEventListener('input', this.updateCubeSize);
				
				// document.addEventListener('DOMContentLoaded', () => {
				// 	console.log("calling boundingbox resize function")
				// 	document.getElementById('bounding_box_width').addEventListener('input', this.updateCubeSize);
				// 	document.getElementById('bounding_box_length').addEventListener('input', this.updateCubeSize);
				// 	document.getElementById('bounding_box_height').addEventListener('input', this.updateCubeSize);
				// 	//document.getElementById('update_size').addEventListener('click', saveToJson);
				
				// 	// 初始化位置
				// 	//updatePositions();
				// });
				
				

				//document.getElementById('bounding_box_width').addEventListener('input', this.updateCubeSize);
				//document.getElementById('bounding_box_length').addEventListener('input', this.updateCubeSize);
				//document.getElementById('bounding_box_height').addEventListener('input', this.updateCubeSize);




				// setup object meshs
				this.object_mesh = new Array();
				this.object_dict = new Object();
				this.object_name_to_ids = new Object();
				this.object_hexs = new Object();
				this.object_label_dict = new Object();
				for (let i = 0; i < this.object_geometry.length; i++) {
					this.object_mesh.push(this.set_mesh(
						this.object_geometry[i],
						new THREE.MeshStandardMaterial({ vertexColors: THREE.VertexColors, metalness: 0.0 })
					));
					// this.object_mesh[i].name = this.resources.scene_object_id[i]+"_"+this.resources.scene_object_name[i];
					this.object_mesh[i].name = this.resources.scene_object_name[i];
					this.object_dict[this.resources.scene_object_id[i]] = this.object_mesh[i];
					this.object_hexs[this.resources.scene_object_id[i]] = this.object_mesh[i].material.emissive.getHex();
					if (this.resources.scene_object_name[i] in this.object_name_to_ids) {
						this.object_name_to_ids[this.resources.scene_object_name[i]].push(this.resources.scene_object_id[i]);
					}
					else {
						this.object_name_to_ids[this.resources.scene_object_name[i]] = [this.resources.scene_object_id[i]];
					}
				}
				this.add_mesh(this.scene, this.object_mesh);
				// this.add_mesh(this.scene, [this.object_mesh[0]]);
				this.loading_bar.style.width = "100%";

				// // axis
				// this.axis = new THREE.AxisHelper();
				// this.scene.add(this.axis);

				document.getElementById("loading_container").style.display = "none";
				document.getElementById("control_bar_container").style.display = 'block';
				// document.getElementById("image_container").style.display = "block";
				document.getElementById("button_container").style.display = "block";

				this.control_bar_display = document.getElementById("control_bar_controls");
				this.setup_control_bar()

				//document.getElementById("control_bar_container").style.display = "block";

				// render scene select
				// this.render_scene_select();

				// render instance list
				this.render_label_list();
				// this.render_label_color(false);
				this.add_label_listener();


				// setup text prompt
				this.container = document.getElementById("sqa_input");
				if (this.task_type == 1) {
					this.setup_prompt_sonly();
				}
				else if (this.task_type == 2) {
					this.setup_prompt_qaonly();
				}
				else if (this.task_type == 3) {
					this.setup_prompt_aonly();
				}
				else if (this.task_type == 4) {
					this.setup_prompt_sonly_noselect();
				}
				else if (this.task_type == 5) {
					this.setup_prompt_aonly_bundled();
				}
				else {
					this.setup_prompt_original();
				}
				//this.setup_annotation_cache_div()
				this.btn.anywhere3D_submit = document.getElementById("btn_anywhere3D_submit");
				this.add_listener(this.btn.anywhere3D_submit, "click", this.on_click_btn_anywhere3D_submit_original);

				this.cur_referring_expressions_cnt = '00'
				this.load_annotation_cache('ReferExp_' + this.cur_referring_expressions_cnt)

				/*
				this.all_referring_expressions = [
					'Facing the bicycle, place a trash bin 0.5m in diameter and 0.75m in height on the floor. It should be located 1m away directly to the right of the bed.',
					'Lean another bicycle of the same size against the old one.',
					'Imagine you are a robot with 1.2m in height and 0.6m in both width and depth. Walk straight when you enter the room and stay 1.5m away from the curtain.',
					'Move the pillow on the opposite side of the bed. It should be placed in the middle.',
					'Move the smaller trash bin next to the refrigerator to a spot 0.5 meters directly in front of the bicycle.',
					'If I have received a new computer monitor, where should I place it so that I can sit down and work? It should be located near the bed.',
					'Add a new floor lamp behind the nightstand to the right of the bed. Make sure it is positioned against the wall and does not obstruct access to the bed or nightstand.',
					'Place a new potted plant in the corner to the left of the laundry basket, ensuring it stands approximately 1.5 meters high without exceeding the height of the nearby cabinet.',
					'Position a new chair next to the triangular-shaped table, opposite the stools, ensuring the chair is at a 45-degree angle relative to the table\'s side.'
				]
				*/


				//this.cur_referring_expressions_value = ''
				//this.cur_referring_expressions_placeholder = 
				





				// HACK
				// this.insert_center()

				// start rendering
				console.log(this.scene);
				console.log(this.scene_geometry_center);
				this.create_stats();
				this.init_camera()
				// this.render_annotation_results();
				// this.preload_frame();
				this.render();
				// this.on_click_btn_none();

				this.lookat_arrow_camera();
				//console.log("camera position", this.window_mesh.camera.position)
				/*
					x: 1.363258555479875
					y: -1.4497854709625244
					z: 5.550439325899626
				*/
				//console.log("camera quaternion", this.window_mesh.camera.quaternion)
				/*
					Quaternion {_x: 0.2236067977499789, _y: 0.2236067977499789, _z: 0.6708203932499369, _w: 0.6708203932499369, onChangeCallback: ƒ}
				*/

				//var boundingbox_Pos = new THREE.Vector3();


				// document.getElementById('bounding_box_width').addEventListener('input', this.updateCubeSize);
				// document.getElementById('bounding_box_length').addEventListener('input', this.updateCubeSize);
				// document.getElementById('bounding_box_height').addEventListener('input', this.updateCubeSize);

				//console.log(this.window_mesh.camera.position, this.window_mesh.camera.quaternion)

				this.add_listener(document.getElementById('bounding_box_width'), 'input', this.updateCubeSize)
				this.add_listener(document.getElementById('bounding_box_length'), 'input', this.updateCubeSize)
				this.add_listener(document.getElementById('bounding_box_height'), 'input', this.updateCubeSize)
				this.add_listener(document.getElementById('bounding_box_rotation_angle'), 'input', this.updateCubeAngle)
				this.add_listener(document.getElementById('bounding_box_center_x_position'), 'input', this.updateCubePosition)
				this.add_listener(document.getElementById('bounding_box_center_y_position'), 'input', this.updateCubePosition)
				this.add_listener(document.getElementById('bounding_box_center_z_position'), 'input', this.updateCubePosition)
				//this.add_listener(document.getElementById('show_axis'), "click", this.createAxes)
				//this.add_listener(document.getElementById('hide_axis'), "click", this.removeAxes)
				this.add_listener(document.getElementById('call_axes_button'), "click", this.callAxes)
				//this.add_listener(document.getElementById('show_scale_cylinder'), "click", this.add_scale_cylinder)
				//this.add_listener(document.getElementById('hide_scale_cylinder'),"click",this.remove_scale_cylinder)
				this.add_listener(document.getElementById('call_cylinder_button'), "click", this.callCylinder)
				this.add_listener(document.getElementById('scale_cylinder_height'),"input", this.modify_scale_cylinder)
				this.add_listener(document.getElementById('scale_cylinder_rotation_angle'),"input", this.rotate_cylinder)
				this.add_listener(document.getElementById('new_referring_expressions'), "focus", this.modify_referring_expressions)
				this.add_listener(document.getElementById('reset_bounding_box_button'), "click", this.reset_bounding_box)
				this.add_listener(document.getElementById('reset_scale_cylinder_button'), "click", this.reset_scale_cylinder)

				//this.btn.anywhere3D_submit = document.getElementById("btn_anywhere3D_submit");
				
				this.add_listener(document.getElementById('RE00'), "click", this.load_annotation_cache, 'ReferExp_00')
				this.add_listener(document.getElementById('RE01'), "click", this.load_annotation_cache, 'ReferExp_01')
				this.add_listener(document.getElementById('RE02'), "click", this.load_annotation_cache, 'ReferExp_02')
				this.add_listener(document.getElementById('RE03'), "click", this.load_annotation_cache, 'ReferExp_03')
				this.add_listener(document.getElementById('RE04'), "click", this.load_annotation_cache, 'ReferExp_04')
				this.add_listener(document.getElementById('RE05'), "click", this.load_annotation_cache, 'ReferExp_05')
				this.add_listener(document.getElementById('RE06'), "click", this.load_annotation_cache, 'ReferExp_06')
				this.add_listener(document.getElementById('RE07'), "click", this.load_annotation_cache, 'ReferExp_07')
				this.add_listener(document.getElementById('RE08'), "click", this.load_annotation_cache, 'ReferExp_08')
				//this.add_listener(document.getElementById('RE09'), "click", this.load_annotation_cache, '09')
				


				//console.log("Z 坐标范围: ", this.scene_geometry.boundingBox.min.z, "到", this.scene_geometry.boundingBox.max.z)


				//console.log("hello")
				//console.log(this.bounding_box.position)
				//console.log(this.window_mesh.camera.position, this.window_mesh.camera.oritentation)

				/*
				document.addEventListener('DOMContentLoaded', () => {
					console.log("calling boundingbox resize function")
					document.getElementById('bounding_box_width').addEventListener('input', this.updateCubeSize);
					document.getElementById('bounding_box_length').addEventListener('input', this.updateCubeSize);
					document.getElementById('bounding_box_height').addEventListener('input', this.updateCubeSize);
					//document.getElementById('update_size').addEventListener('click', saveToJson);
				
					// 初始化位置
					//updatePositions();
				});
				*/
			});
		});

	}

	/*
	createLabel(text, position) {
		console.log("calling create label")
		
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		context.font = '32px Arial';
		context.fillStyle = 'black';
		context.fillText(text, 0, 32);
		
		const texture = new THREE.Texture(canvas);
		texture.needsUpdate = true;
	
		const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
		const sprite = new THREE.Sprite(spriteMaterial);
		sprite.position.copy(position);
		sprite.scale.set(1, 0.5, 1); // 调整大小
		return sprite
	}
	*/

	/*
	setup_annotation_cache_div(){
		this.annotation_div_innerhtml = 
		`
			<div id = 'annotation_cache_div'></div>
		`;
	}
		*/

	load_annotation_cache(RE_id){

		//console.log(this.window_mesh.camera)
		//console.log("this.all_referring_expressions", this.all_referring_expressions)
		//console.log("this.cur_referring_expressions_cnt", this.cur_referring_expressions_cnt)
		this.cur_referring_expressions_cnt = RE_id.split("_")[1];
		//parameter should be this.cur_referring_expressions_cnt
		//console.log(annotation_cache_div)
		let annotation_cache_div = document.getElementById('annotation_cache_div');
		let annotation_cache_data = annotation_cache_div.textContent.trim() ? JSON.parse(annotation_cache_div.textContent) : {};
		console.log("annotation cache data", annotation_cache_data)
		//if (annotation_cache_data == null){
		//	annotation_cache_data = {}
		//}
		if(this.cur_referring_expressions_cnt in annotation_cache_data){
			console.log("cur cache data", annotation_cache_data[this.cur_referring_expressions_cnt])
			let cur_cache_data = annotation_cache_data[this.cur_referring_expressions_cnt]

			//set bounding box with cache
			this.bounding_box_width = cur_cache_data['bounding_box_width'];
			this.bounding_box_length = cur_cache_data['bounding_box_length'];
			this.bounding_box_height = cur_cache_data['bounding_box_height'];

			this.bounding_box.geometry.dispose(); // 释放旧的几何体资源
			this.bounding_box.geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(this.bounding_box_width, this.bounding_box_length, this.bounding_box_height));
			this.bounding_box.position.set(cur_cache_data['bounding_box_xpos'], cur_cache_data['bounding_box_ypos'], cur_cache_data['bounding_box_zpos']);

			document.getElementById('bounding_box_width_value').textContent = this.bounding_box_width;
			document.getElementById('bounding_box_length_value').textContent = this.bounding_box_length;
			document.getElementById('bounding_box_height_value').textContent = this.bounding_box_height;

			document.getElementById('bounding_box_width').value = this.bounding_box_width;
			document.getElementById('bounding_box_length').value = this.bounding_box_length;
			document.getElementById('bounding_box_height').value = this.bounding_box_height;
			

			document.getElementById('bounding_box_center_x_position').value = 0;
			document.getElementById('bounding_box_center_y_position').value = 0;
			document.getElementById('bounding_box_center_z_position').value = 0;
			this.bounding_box_bar_x = 0
			this.bounding_box_bar_y = 0
			this.bounding_box_bar_z = 0

			document.getElementById('bounding_box_rotation_value').textContent = cur_cache_data['bounding_box_rotation_angle'];
			document.getElementById('bounding_box_rotation_angle').value = cur_cache_data['bounding_box_rotation_angle'];

			this.bounding_box.rotation.z = THREE.Math.degToRad(cur_cache_data['bounding_box_rotation_angle']);
			this.bounding_box_rotation_angle = cur_cache_data['bounding_box_rotation_angle'];

			//set camera with cache
			//console.log(this.window_mesh.camera)
			let camera_pos = cur_cache_data['window_camera_position']
			let camera_qua = cur_cache_data['window_camera_quaternion']
			this.window_mesh.camera.position.set(camera_pos.x, camera_pos.y, camera_pos.z)
			this.window_mesh.camera.quaternion.set(camera_qua._x, camera_qua._y, camera_qua._z, camera_qua._w)

			//set referring expressions with cache
			document.getElementById('original_referring_expressions').textContent = 'Original Referring Expressions: ' + this.all_referring_expressions[this.cur_referring_expressions_cnt]
			document.getElementById('new_referring_expressions').placeholder = cur_cache_data['new_referring_expressions']
			document.getElementById('new_referring_expressions').value = ''

			//set cylinder with cache
			this.scale_cylinder.geometry.dispose(); 
			this.scale_cylinder.geometry = new THREE.CylinderGeometry(0.2, 0.2, cur_cache_data['scale_cylinder_height'], 32);
			this.scale_cylinder.position.set(cur_cache_data['scale_cylinder_xpos'], cur_cache_data['scale_cylinder_ypos'], cur_cache_data['scale_cylinder_zpos']); 
			this.scale_cylinder.rotation.z = THREE.Math.degToRad(cur_cache_data['scale_cylinder_rotation_angle']);

			document.getElementById('scale_cylinder_height_value').textContent = cur_cache_data['scale_cylinder_height']
			document.getElementById('scale_cylinder_height').value = cur_cache_data['scale_cylinder_height']
			document.getElementById('scale_cylinder_rotation_value').textContent = cur_cache_data['scale_cylinder_rotation_angle']
			document.getElementById('scale_cylinder_rotation_angle').value = cur_cache_data['scale_cylinder_rotation_angle']

			if(this.scale_cylinder_exist == 2){
				this.add_mesh(this.scene,[this.scale_cylinder])
				this.scale_cylinder_exist = 1
				document.getElementById('show_hide_cylinder').textContent = 'Hide Cylinder'
			}


		}else{
			//no cache for cur_referring_expressions
			//reset bounding box
			this.reset_bounding_box()
			
			//reset scale_cylinder
			if(this.scale_cylinder_exist == 2){
				this.add_mesh(this.scene,[this.scale_cylinder])
				this.scale_cylinder_exist = 1
				document.getElementById('show_hide_cylinder').textContent = 'Hide Cylinder'
			}
			this.reset_scale_cylinder()

			//reset referring expressions
			document.getElementById('original_referring_expressions').textContent = 'Original Referring Expressions: ' + this.all_referring_expressions[this.cur_referring_expressions_cnt]
			document.getElementById('new_referring_expressions').placeholder = this.all_referring_expressions[this.cur_referring_expressions_cnt]
			document.getElementById('new_referring_expressions').value = ''

			//reset camera
			
			this.init_camera()
			//console.log(this.window_mesh.camera)
			//this.window_mesh.camera.position = cur_cache_data['window_camera_position'] 
			//this.window_mesh.camera.quaternion = cur_cache_data['window_camera_quaternion']
		}

	}

	callAxes(){
		console.log("calling axes out of nowhere")
		if (this.axes_exist == 1){
			this.scene.remove(this.xAxis);
			this.scene.remove(this.yAxis);
			this.scene.remove(this.zAxis);
			this.axes_exist = 0
			document.getElementById('show_hide_axes').textContent = 'Show Axes'

		}else if (this.axes_exist == 0){
			const xOrigin = new THREE.Vector3(-7.5, 0, 0); // 箭头起点
			const xDirection = new THREE.Vector3(1, 0, 0); // X 轴方向
			const xLength = 15; // 箭头长度
			const xHeadLength = 0.5; // 箭头头部长度
			const xHeadWidth = 0.2; // 箭头头部宽度
			this.xAxis = new THREE.ArrowHelper(xDirection, xOrigin, xLength, 0xff0000, xHeadLength, xHeadWidth);
			this.add_mesh(this.scene, [this.xAxis])


			const yOrigin = new THREE.Vector3(0, -7.5, 0); // 箭头起点
			const yDirection = new THREE.Vector3(0, 1, 0); // Y 轴方向
			const yLength = 15; // 箭头长度
			const yHeadLength = 0.5; // 箭头头部长度
			const yHeadWidth = 0.2; // 箭头头部宽度
			this.yAxis = new THREE.ArrowHelper(yDirection, yOrigin, yLength, 0x228B22, yHeadLength, yHeadWidth);
			this.add_mesh(this.scene, [this.yAxis])


			const zOrigin = new THREE.Vector3(0, 0, -7.5); // 箭头起点
			const zDirection = new THREE.Vector3(0, 0, 1); // Z 轴方向
			const zLength = 15; // 箭头长度
			const zHeadLength = 0.5; // 箭头头部长度
			const zHeadWidth = 0.2; // 箭头头部宽度
			this.zAxis = new THREE.ArrowHelper(zDirection, zOrigin, zLength, 0x0000ff, zHeadLength, zHeadWidth);
			this.add_mesh(this.scene, [this.zAxis])

			this.axes_exist = 1;
			document.getElementById('show_hide_axes').textContent = 'Hide Axes'


		}
		
	}


	callCylinder(){
		
		//1: exist and revealed
		//2: exist but hide 
		if(this.scale_cylinder_exist == 1){
			this.scene.remove(this.scale_cylinder)
			this.scale_cylinder_exist = 2
			document.getElementById('show_hide_cylinder').textContent = 'Show Cylinder'

		}else if(this.scale_cylinder_exist == 2){
			this.add_mesh(this.scene,[this.scale_cylinder])
			this.scale_cylinder_exist = 1
			document.getElementById('show_hide_cylinder').textContent = 'Hide Cylinder'
		}
	}


	reset_bounding_box(){

		//reset bounding box width, length, height
		this.bounding_box_width = 0.5;
		this.bounding_box_length = 0.5;
		this.bounding_box_height = 0.5;

		this.bounding_box.geometry.dispose(); 
    	this.bounding_box.geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(this.bounding_box_width, this.bounding_box_length, this.bounding_box_height));
		
		document.getElementById('bounding_box_width_value').textContent = 0.5;
		document.getElementById('bounding_box_length_value').textContent = 0.5;
		document.getElementById('bounding_box_height_value').textContent = 0.5;

		document.getElementById('bounding_box_width').value = 0.5;
		document.getElementById('bounding_box_length').value = 0.5;
		document.getElementById('bounding_box_height').value = 0.5;
		
		//reset bounding box xpos, ypos, zpos
		this.bounding_box.position.set(0, 0, 0);
		document.getElementById('bounding_box_center_x_position').value = 0;
		document.getElementById('bounding_box_center_y_position').value = 0;
		document.getElementById('bounding_box_center_z_position').value = 0;
		this.bounding_box_bar_x = 0;
		this.bounding_box_bar_y = 0;
		this.bounding_box_bar_z = 0;

		//reset bounding box rotation angle
		document.getElementById('bounding_box_rotation_value').textContent = 0;
		document.getElementById('bounding_box_rotation_angle').value = 0;

		this.bounding_box.rotation.z = THREE.Math.degToRad(0);
		this.bounding_box_rotation_angle = 0;
		

	}

	modify_scale_cylinder() {
		console.log('calling scale cylinder',this.scale_cylinder_exist)
		if (this.scale_cylinder_exist == 2) return;

		const new_cylinder_height = parseFloat(document.getElementById('scale_cylinder_height').value) || 0.01;
		document.getElementById('scale_cylinder_height_value').textContent = new_cylinder_height;
		this.scale_cylinder.geometry.dispose(); 
		this.scale_cylinder.geometry = new THREE.CylinderGeometry(0.2, 0.2, new_cylinder_height, 32);
	}

	rotate_cylinder() {
		if (this.scale_cylinder_exist == 2) return;
		const cylinder_rotation_angle = parseFloat(document.getElementById('scale_cylinder_rotation_angle').value) || 0; // 获取旋转角度（0-360度）
		document.getElementById('scale_cylinder_rotation_value').textContent = cylinder_rotation_angle;
		this.scale_cylinder.rotation.z = THREE.Math.degToRad(cylinder_rotation_angle);

	}

	reset_scale_cylinder(){
		if (this.scale_cylinder_exist == 2){
			return
		}else if(this.scale_cylinder_exist == 1){
			this.scale_cylinder.geometry.dispose();
			this.scale_cylinder.geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 32);
			this.scale_cylinder.position.set(0, 0, 0); 
			this.scale_cylinder.rotation.z = 0
			document.getElementById('scale_cylinder_height_value').textContent = 0.5;
			document.getElementById('scale_cylinder_height').value = 0.5
			document.getElementById('scale_cylinder_rotation_value').textContent = 0
			document.getElementById('scale_cylinder_rotation_angle').value = 0
		}	
	}

	/*
	remove_scale_cylinder() {
		console.log('calling remove cylinder',this.scale_cylinder_exist)
		if (this.scale_cylinder_exist == 0) return;
		//this.scene.scale_cylinder.visible = false;
		this.scene.remove(this.scale_cylinder)
		//this.scale_cylinder_exist = 0;

	}
	*/
		
	updateCubeSize() {


		const new_width = parseFloat(document.getElementById('bounding_box_width').value) || 0.01;
		const new_length = parseFloat(document.getElementById('bounding_box_length').value) || 0.01; // 深度
		const new_height = parseFloat(document.getElementById('bounding_box_height').value) || 0.01; // 高度
		document.getElementById('bounding_box_width_value').textContent = new_width;
		document.getElementById('bounding_box_length_value').textContent = new_length;
		document.getElementById('bounding_box_height_value').textContent = new_height;

		this.bounding_box_width = new_width;
		this.bounding_box_length = new_length;
		this.bounding_box_height = new_height;

		const bounding_box_current_position = this.bounding_box.position.clone(); 

		this.bounding_box.geometry.dispose(); // 释放旧的几何体资源
    	this.bounding_box.geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(new_width, new_length, new_height));
		this.bounding_box.position.copy(bounding_box_current_position); 


		//this.bounding_box.scale.set(scale_width, scale_length, scale_height);
		//console.log(this.bounding_box)	
		//this.add_mesh(this.scene,[this.bounding_box])
		
		
	}

	updateCubeAngle(){
		const new_rotation_angle = parseFloat(document.getElementById('bounding_box_rotation_angle').value) || 0; // 获取旋转角度（0-360度）
		document.getElementById('bounding_box_rotation_value').textContent = new_rotation_angle;
		this.bounding_box.rotation.z = THREE.Math.degToRad(new_rotation_angle);
		this.bounding_box_rotation_angle = new_rotation_angle

	}

	updateCubePosition(){
		//using x, y, z as absolute position of bounding box
		/*
		const bounding_box_center_x_pos = parseFloat(document.getElementById('bounding_box_center_x_position').value) || 0;
		const bounding_box_center_y_pos = parseFloat(document.getElementById('bounding_box_center_y_position').value) || 0;
		const bounding_box_center_z_pos = parseFloat(document.getElementById('bounding_box_center_z_position').value) || 0;

		this.bounding_box.position.x = bounding_box_center_x_pos
		this.bounding_box.position.y = bounding_box_center_y_pos
		this.bounding_box.position.z = bounding_box_center_z_pos
		*/

		//using delta x, delta y, delta z as relative position
		const bounding_box_current_position = this.bounding_box.position.clone();

		const bounding_box_new_bar_x = parseFloat(document.getElementById('bounding_box_center_x_position').value) 
    	const bounding_box_new_bar_y = parseFloat(document.getElementById('bounding_box_center_y_position').value) 
    	const bounding_box_new_bar_z = parseFloat(document.getElementById('bounding_box_center_z_position').value)

		const bounding_box_delta_bar_x = bounding_box_new_bar_x - this.bounding_box_bar_x
		const bounding_box_delta_bar_y = bounding_box_new_bar_y - this.bounding_box_bar_y
		const bounding_box_delta_bar_z = bounding_box_new_bar_z - this.bounding_box_bar_z


		this.bounding_box.position.x = bounding_box_current_position.x + bounding_box_delta_bar_x;
		this.bounding_box.position.y = bounding_box_current_position.y + bounding_box_delta_bar_y;
		this.bounding_box.position.z = bounding_box_current_position.z + bounding_box_delta_bar_z;

		this.bounding_box_bar_x = bounding_box_new_bar_x
		this.bounding_box_bar_y = bounding_box_new_bar_y
		this.bounding_box_bar_z = bounding_box_new_bar_z
		//console.log("hello")
		//console.log(this.bounding_box.position)

	}
	modify_referring_expressions(){
		var input_referring_expressions_field = document.getElementById('new_referring_expressions');
		//var placeholdertext = input_referring_expressions_field.placeholder;
		if (input_referring_expressions_field.value === "") {
            input_referring_expressions_field.value = input_referring_expressions_field.placeholder;
			//this.cur_referring_expressions_value = this.cur_referring_expressions_placeholder;
        }

	}


	render_confirmation_code() {
		document.getElementById('confirmation').innerHTML = '';
		let label = document.createElement('label');
		label.style="font-size: 35px; color: blue";
		label.innerHTML = "Confirmation code (please paste it back to MTurk, then close the window): ";
		let c = document.createElement('p');
		c.style = "font-size: 25px";
		c.innerHTML = this.hash2;

		document.getElementById("confirmation").appendChild(label);
		document.getElementById("confirmation").appendChild(c);
	}

	render_limit(max, cur) {
		let limit_e = document.getElementById('limit');
		limit_e.innerHTML = `
			<p style="font-size: 25px"> You've submitted <span style="font-size: 35px; color: red"> ${cur} </span> responses. Total responses needed: <span style="font-size: 35px; color: red"> ${max}</span>.
		`;
	}

	setup_control_bar(){

		this.control_bar_display.innerHTML = `
		

		<div style="display: flex; justify-content: space-between;">
			<div style="width: 100%; padding: 20px; background-color: #f0f0f0; display: flex; flex-direction: column; justify-content: flex-start; overflow: auto">			
				
				<button id="call_axes_button" style="width: 120px; height: 35px;" ><span id="show_hide_axes">Show Axes</span></button>
				<div style="display: flex; justify-content: space-between; width: 100%;">
					<p><span style="font-size: 1.2em;">Bounding Box</span></p>
					<button id="reset_bounding_box_button" style="width: 120px; height: 35px;" >Reset</button>
				</div>
				<div style="display: flex; align-items: center; width: 100%;">
					<label for="bounding_box_width" style="color: #ff0000; width: 30%;">W: <span id="bounding_box_width_value">0.5</span></label>
					<input type="range" id="bounding_box_width" min="0" max="4" step="0.01" value="0.5" style="flex-grow: 1;">
				</div>
				<div style="display: flex; align-items: center; width: 100%;">
					<label for="bounding_box_length" style="color: #228B22; width: 30%;">L: <span id="bounding_box_length_value">0.5</span></label>
					<input type="range" id="bounding_box_length" min="0" max="4" step="0.01" value="0.5" style="flex-grow: 1;">
				</div>
				<div style="display: flex; align-items: center; width: 100%;">
					<label for="bounding_box_height" style="color: #0000ff; width: 30%;">H: <span id="bounding_box_height_value">0.5</span></label>
					<input type="range" id="bounding_box_height" min="0" max="3" step="0.01" value="0.5" style="flex-grow: 1;">
				</div>
				<div style="display: flex; align-items: center; width: 100%;">
					<label for="bounding_box_rotation_angle" style="width: 30%;">Rot: <span id="bounding_box_rotation_value">0</span></label>
					<input type="range" id="bounding_box_rotation_angle" min="0" max="360" step = "1" value="0" style="flex-grow: 1;"><br>
				</div>
				<div style="display: flex; align-items: center; width: 100%;">
					<label for="bounding_box_center_x_position" style="color: #ff0000; width: 30%;">X: </label>
					<input type="range" id="bounding_box_center_x_position" min="-5" max="5" step="0.01" value="0" style="flex-grow: 1;">
				</div>
				<div style="display: flex; align-items: center; width: 100%;">
					<label for="bounding_box_center_y_position" style="color: #228B22; width: 30%;">Y: </label>
					<input type="range" id="bounding_box_center_y_position" min="-5" max="5" step="0.01" value="0" style="flex-grow: 1;">
				</div>
				<div style="display: flex; align-items: center; width: 100%;">
					<label for="bounding_box_center_z_position" style="color: #0000ff; width: 30%;">Z: </label>
					<input type="range" id="bounding_box_center_z_position" min="-5" max="5" step="0.01" value="0" style="flex-grow: 1;">
				</div>
				
				<div style="display: flex; justify-content: space-between; width: 100%;">
					<p><span style="font-size: 1.2em;">Cylinder</span></p>
					<button id="reset_scale_cylinder_button" style="width: 120px; height: 35px; font-size: 14px;" >Reset</button>
					<button id="call_cylinder_button" style="width: 120px; height: 35px; font-size: 14px;" ><span id="show_hide_cylinder">Hide Cylinder</span></button>
				</div>
				<div style="display: flex; align-items: center; width: 100%;">
					<label for="scale_cylinder_diameter" style="width: 30%;">L: <span id="scale_cylinder_height_value">0.5</span></label>
					<input type="range" id="scale_cylinder_height" min="0" max="10" step = "0.01" value="0.5" style="flex-grow: 1;">		
				</div>
				<div style="display: flex; align-items: center; width: 100%;">
					<label for="scale_cylinder_rotation_angle" style="width: 30%;">Rot: <span id="scale_cylinder_rotation_value">0</span></label>
					<input type="range" id="scale_cylinder_rotation_angle" min="0" max="360" step = "1" value="0" style="flex-grow: 1;">
				</div>	
			</div>
		</div>


		`
	}

	//////////////////////////////////////
	// Differnet rendering options

	// original
	setup_prompt_original() {
		this.container.innerHTML = `
		<h1><hr/></h1>
		<div id = 'annotation_cache_div' style="display: none;"></div>
		<p style="margin-bottom: 10px;">
			<span style="font-size: 1.5em;"><b>Referring Expressions ID:</span>
			
			<button id="RE00" style="width: 8%;">00</button>
			<button id="RE01" style="width: 8%;">01</button>
			<button id="RE02" style="width: 8%;">02</button>
			<button id="RE03" style="width: 8%;">03</button>
			<button id="RE04" style="width: 8%;">04</button>
			<button id="RE05" style="width: 8%;">05</button>
			<button id="RE06" style="width: 8%;">06</button>
			<button id="RE07" style="width: 8%;">07</button>
			<button id="RE08" style="width: 8%;">08</button>
			<!--button id="RE09" style="width: 8%;">09</button-->
			
			</b>
			<div>
				<span id='original_referring_expressions'></span></br>
				<input type="text" class="form-control" id="new_referring_expressions" placeholder='' value=''>
			</div>
		</p>
		<h1><hr/></h1>
		<div style="display: flex; width: 100%;">
			<!--button id="btn_anywhere3D_load" class="btn btn-primary btn-lg" style="width: 45%; margin-left: 2.5%">Load</button-->
			<button id="btn_anywhere3D_submit" class="btn btn-primary btn-lg" type="submit" style="width: 100%">Save</button>
		</div>
		`;

		//this.btn.anywhere3D_submit = document.getElementById("btn_anywhere3D_submit");
		//this.add_listener(this.btn.anywhere3D_submit, "click", this.on_click_btn_anywhere3D_submit_original);
	}
	on_click_btn_anywhere3D_submit_original() {
		
		var record = {};

		//save scene information
		record['datasetname'] = this.resources.datasetname;
		record['scene_id'] = this.resources.scene_id;

		//save referring_expressions
		var input_referring_expressions_field = document.getElementById("new_referring_expressions");
		if (input_referring_expressions_field.value === ''){
			record['new_referring_expressions'] = input_referring_expressions_field.placeholder
		}else{
			record['new_referring_expressions'] = input_referring_expressions_field.value
		}
		record['original_referring_expressions'] = this.all_referring_expressions[this.cur_referring_expressions_cnt]


		
		//save bounding box information
		/*
		console.log("BoundingBoxWidth", this.bounding_box_width)
		console.log("BoundingBoxLength", this.bounding_box_length)
		console.log("BoundingBoxHeight", this.bounding_box_height)
		*/

		record['bounding_box_width'] = this.bounding_box_width
		record['bounding_box_length'] = this.bounding_box_length
		record['bounding_box_height'] = this.bounding_box_height

		/*
		console.log(this.bounding_box.position)
		console.log(this.bounding_box.position['x'])
		console.log(this.bounding_box.position['y'])
		console.log(this.bounding_box.position['z'])
		*/

		record['bounding_box_xpos'] = this.bounding_box.position.x
		record['bounding_box_ypos'] = this.bounding_box.position.y
		record['bounding_box_zpos'] = this.bounding_box.position.z

		//console.log("bounding box rotation angle",this.bounding_box_rotation_angle)


		let BoundingBox_Rotation_Angle = THREE.Math.radToDeg(this.bounding_box.rotation.z)
		BoundingBox_Rotation_Angle = Math.round((BoundingBox_Rotation_Angle % 360 + 360) % 360)
		record['bounding_box_rotation_angle'] = this.bounding_box_rotation_angle //Math.round((BoundingBox_Rotation_Angle % 360 + 360) % 360)
		//assert(record['bounding_box_rotation_angle'] == this.bounding_box_rotation_angle)


		/*
		console.log("window camera position", this.window_mesh.camera.position)
		console.log("camera oritentation", this.window_mesh.camera.quaternion)
		*/



		//save cylinder information
		

		// 将角度限制在 0 到 360 范围内
		record['scale_cylinder_xpos'] = this.scale_cylinder.position.x
		record['scale_cylinder_ypos'] = this.scale_cylinder.position.y
		record['scale_cylinder_zpos'] = this.scale_cylinder.position.z
		record['scale_cylinder_height'] = this.scale_cylinder.geometry.parameters.height
		let cylinderRotationAngle = THREE.Math.radToDeg(this.scale_cylinder.rotation.z)
		record['scale_cylinder_rotation_angle'] = Math.round((cylinderRotationAngle % 360 + 360) % 360)



		//save camera information
		record['window_camera_position'] = this.window_mesh.camera.position
		record['window_camera_quaternion'] = this.window_mesh.camera.quaternion
		//console.log(record)


		//console.log("referring_expressions_cnt", this.cur_referring_expressions_cnt)
		//console.log(input_referring_expressions_field.placeholder)
		//console.log(input_referring_expressions_field.value)

		const annotation_cache_div = document.getElementById('annotation_cache_div') 
		const annotation_cache_data = annotation_cache_div.textContent.trim() ? JSON.parse(annotation_cache_div.textContent) : {};
		//const annotation_cache_data = JSON.parse(annotation_cache_div.textContent)
		annotation_cache_data[this.cur_referring_expressions_cnt] = record
		annotation_cache_div.textContent = JSON.stringify(annotation_cache_data)

		//this.load_annotation_cache(this.cur_referring_expressions_cnt)


		/*
		console.log("this.resources.sqa_db_collection_name", this.resources.sqa_db_collection_name)
		window.xhr_post(JSON.stringify(record), "/apps/database/sqa3d/save/sqa_collection={0}".format(this.resources.sqa_db_collection_name)).then(() => {
			console.log("inserted sqa!");
			alert(["Recorded.", record.datasetname, record.scene_id, record.new_referring_expressions,"with bounding box size",record.bounding_box_width, record.bounding_box_length, record.bounding_box_height].join(' '));
		});
		*/


		/*
		var input_referring_expressions_field = document.getElementById("new_referring_expressions");
		this.cur_referring_expressions_cnt = '0' + String(Number(this.cur_referring_expressions_cnt) + 1);

		console.log("after change, this.cur_referring_expressions_cnt", this.cur_referring_expressions_cnt)
		var number_referring_expressions_cnt = Number(this.cur_referring_expressions_cnt)


		let currentUrl = window.location.href;
		console.log("currenturl", currentUrl)

		if (number_referring_expressions_cnt > 8){
			this.cur_referring_expressions_cnt = '00'
			let regex_scene_id = /scene_id=scene\d{4}_\d{2}/;
			console.log(this.resources.scene_list.length, scene_index)
			var scene_index = this.resources.scene_list.indexOf(this.resources.scene_id)
			if (scene_index == (this.resources.scene_list.length - 1)){
				currentUrl = currentUrl.replace(regex_scene_id, "scene_id=scene0000_00")
				//input_referring_expressions_field.placeholder = this.all_referring_expressions[this.cur_referring_expressions_cnt]
				//input_referring_expressions_field.value = ''
				let regex_refer_exp = /referring_expressions_id=(\d+)/;
				let newUrl = currentUrl.replace(regex_refer_exp, `referring_expressions_id=${this.cur_referring_expressions_cnt}`)
				window.location.href = newUrl;
				
			}else{
				//console.log("replacing, ",this.resources.scene_list[scene_index + 1])
				currentUrl = currentUrl.replace(regex_scene_id, `scene_id=${this.resources.scene_list[scene_index + 1]}`)
				//input_referring_expressions_field.placeholder = this.all_referring_expressions[this.cur_referring_expressions_cnt]
				//input_referring_expressions_field.value = ''
				let regex_refer_exp = /referring_expressions_id=(\d+)/;
				let newUrl = currentUrl.replace(regex_refer_exp, `referring_expressions_id=${this.cur_referring_expressions_cnt}`)
				window.location.href = newUrl;
				console.log(this.resources.scene_id)
				
			}
		}else{
			//input_referring_expressions_field.placeholder = this.all_referring_expressions[this.cur_referring_expressions_cnt]
			//input_referring_expressions_field.value = ''

			let regex_refer_exp = /referring_expressions_id=(\d+)/;
			let newUrl = currentUrl.replace(regex_refer_exp, `referring_expressions_id=${this.cur_referring_expressions_cnt}`)
			window.location.href = newUrl;
		}
		*/

	}

	//////////////////////// stage 1: s only
	setup_prompt_sonly() {
		this.prev_submitted_s = "";
		this.container.innerHTML = `
		<h1><hr/></h1>
		<div>
			<label style="font: 45px bold">Step 1</label>
			<p style="display: inline; font-size: 25px"> Explore the 3D scene above. Click 'Tutorial' for details on how to interact with the scene and objects.</p>
		</div>
		<h2><hr/></h2>

		<div>
			<label style="font: 45px bold">Step 2</label>
			<p style="display: inline; font-size: 25px"> Pick a certain <span style="color:blue; font-size:25px">location and orientation</span> (we name them <b>"context"</b>). Navigate the <span style="color:green; font-size:25px">green arrow</span> to the picked <span style="color:blue; font-size:25px">location and orientation</span>.<b> Click and drag the arrow to move, Ctrl+Shift+← or → to rotate</b>.</p>
		</div>
		<h2><hr/></h2>

		<div>
			<label style="font: 45px bold">Step 3</label>
			<p style="display:inline; font-size:25px"> Describe the <span style="color:blue; font-size:25px">location and orientation</span> (<b>"context"</b>) picked in Step 2 with a sentence, then click 'Submit'. The description should locate the <b>unique</b> position in the scene. <b>Ambiguous or wrong description will be <span style="color:red; font-size:25px">rejected</span></b>.</p>
		</div>
		<div>
			<input type="text" class="form-control" id="sqa_situation" placeholder="I'm facing the front door, while there are a few trash cans on my left" required=""></input>
		</div>
			<p style="display:inline; font-size:25px"> Please repeat <b>Step 2&3</b> for <b>${this.max_response}</b> times.</p>
		<div>
		</div>
		<h2><hr/></h2>


		<div id='limit'>
		</div>

		<div id='confirmation'>
		</div>

		<button id="btn_sqa_submit" class="w-100 btn btn-primary btn-lg" type="submit">Submit</button>
		`;

		this.btn.sqa_submit = document.getElementById("btn_sqa_submit");
		this.add_listener(this.btn.sqa_submit, "click", this.on_click_btn_sqa_submit_sonly);

		this.render_limit(this.max_response, this.cur_response);
		if (this.cur_response >= this.max_response) {
			this.render_confirmation_code();
		}
	}

	on_click_btn_sqa_submit_sonly() {
		var situation = document.getElementById("sqa_situation").value;

		if (!situation) {
			alert("Failed. Please fill in the text box!");
		}
		else if (situation == this.prev_submitted_s){
			alert("Failed. You cannot submit the same context again!");
		}
		else if (this.cur_response >= this.max_response) {
			alert("Failed. You already met the required amount of responses.");
		}
		else {
			var record = new Object();
			record.scene_id = this.resources.scene_id;
			var pos = new THREE.Vector3()
			pos = this.arrow.getWorldPosition(pos);
			record.agent_pos = pos;
			record.agent_rot = this.arrow.quaternion;
			record.situation = situation;
			record.hash1 = this.hash1;
			record.hash2 = this.hash2;
			record.task_db = this.task_db;
			window.xhr_post(JSON.stringify(record), "/apps/database/sqa3d/save/sqa_collection={0}".format(this.resources.sqa_db_collection_name)).then(() => {
				console.log("inserted s!");
				this.cur_response += 1;
				alert(["Recorded.", situation].join(' '));
				this.prev_submitted_s = situation;
				this.render_limit(this.max_response, this.cur_response);
				if (this.max_response <= this.cur_response) {
					this.render_confirmation_code();
				}
			});
		}
	}
	//////////////////////////


	//////////////////////// stage 1.1: activity-based situation filling
	setup_prompt_sonly_noselect() {
		this.prev_submitted_s = "";
		this.container.innerHTML = `
		<h1><hr/></h1>
		<div>
			<label style="font: 45px bold">Step 1</label>
			<p style="display: inline; font-size: 25px"> Explore the 3D scene above. Click 'Tutorial' for details on how to interact with the scene and objects.</p>
		</div>
		<h2><hr/></h2>

		<div>
			<label style="font:45px bold">Step 2</label>
			<p style="display:inline; font-size:25px"> Imagine your location now is the same as the the <span style='color: green'>green arrow</span> in the scene, and you are facing towards the same direction it points at. Describe the <span style="color:blue; font-size:25px">location and orientation</span> with a sentence, then click 'Submit'. The description should locate the <b>unique</b> position in the scene. <b>Ambiguous or wrong descriptions will be <span style="color:red; font-size:25px">rejected</span></b>. <b>Template-alike (simple) descriptions will be <span style="color:red; font-size:25px">rejected</span></b>. </p>
		</div>
		<div>
			<input type="text" class="form-control" id="sqa_situation" placeholder="Waiting for my paper to be scanned, I'm trying to throw a paper ball into the trash can on my 1 o'clock direction" required=""></input>
		</div>
		<p style="display:inline; font-size:25px"> Please repeat <b>Step 2</b> for <b>${this.max_response}</b> times (Note: there will be a new green arrow for each response).</p>
		<h2><hr/></h2>

		<div id='limit'>
		</div>

		<div id='confirmation'>
		</div>

		<button id="btn_sqa_submit" class="w-100 btn btn-primary btn-lg" type="submit">Submit</button>
		`;

		this.btn.sqa_submit = document.getElementById("btn_sqa_submit");
		this.add_listener(this.btn.sqa_submit, "click", this.on_click_btn_sqa_submit_sonly_noselect);

		this.arrow_controls.enabled = false;
		this.arrow_drag_controls.enabled = false;

		// load agent pose
		if (this.cur_response < this.max_response) {
			this.load_arrow_pose(this.agent_pos[this.cur_response], this.agent_rot[this.cur_response]);
		}

		this.render_limit(this.max_response, this.cur_response);
		if (this.cur_response >= this.max_response) {
			this.render_confirmation_code();
		}
	}

	load_arrow_pose(pos, rot) {
		let agent_pos = new THREE.Vector3();
		agent_pos.fromArray(Object.values(pos));
		let agent_rot = new THREE.Quaternion();
		agent_rot.fromArray(Object.values(rot));
		this.arrow.setRotationFromQuaternion(agent_rot);
		this.arrow.position.set(agent_pos.x, agent_pos.y, agent_pos.z);
		// Must call this or the arrow pos won't update immedaitely
		this.arrow.updateMatrixWorld(true);
		this.lookat_arrow_camera();
	}

	on_click_btn_sqa_submit_sonly_noselect() {
		var situation = document.getElementById("sqa_situation").value;

		if (!situation) {
			alert("Failed. Please fill in the text box!");
		}
		else if (situation == this.prev_submitted_s){
			alert("Failed. You cannot submit the same sentence again!");
		}
		else if (this.cur_response >= this.max_response) {
			alert("Failed. You already met the required amount of responses.");
		}
		else {
			var record = new Object();
			record.scene_id = this.resources.scene_id;
			var pos = new THREE.Vector3()
			pos = this.arrow.getWorldPosition(pos);
			record.agent_pos = pos;
			record.agent_rot = this.arrow.quaternion;
			record.situation = situation;
			record.hash1 = this.hash1;
			record.hash2 = this.hash2;
			record.task_db = this.task_db;
			window.xhr_post(JSON.stringify(record), "/apps/database/sqa3d/save/sqa_collection={0}".format(this.resources.sqa_db_collection_name)).then(() => {
				console.log("inserted s no select!");
				this.cur_response += 1;
				alert("Recorded.");
				this.prev_submitted_s = situation;
				this.render_limit(this.max_response, this.cur_response);
				if (this.max_response <= this.cur_response) {
					this.render_confirmation_code();
				}
				else {
					this.load_arrow_pose(this.agent_pos[this.cur_response], this.agent_rot[this.cur_response]);
				}
			});
		}
	}

	//////////////////////// stage 2: qa only
	setup_prompt_qaonly() {
		this.prev_submitted_q = "";
		this.container.innerHTML = `
		<h1><hr/></h1>

		<a href="#" onclick="function toggleText() {
			var e0 = document.getElementById('prompt0');
			var e1 = document.getElementById('prompt1');
			var e2 = document.getElementById('prompt2');
			e0.hidden = !e0.hidden;
			e1.hidden = !e1.hidden;
			e2.hidden = !e2.hidden;
		}toggleText();">Toggle the text prompt</a>
		<div id='prompt0'>
			<label style="font: 45px bold">Step 1</label>
			<p style="display: inline; font-size: 25px"> Explore the 3D scene above. Click 'Tutorial' for details on how to interact with the scene and objects.</p>
		</div>
		<h2><hr/></h2>

		<div>
			<div id='prompt1'>
			<label style="font:45px bold">Step 2</label>
			<p style="display:inline; font-size:25px"> Imagine your location now is the same as the the <span style='color: green'>green arrow</span> in the scene, and you are facing towards the same direction it points at. The following is a description of your current <b>status</b>:</p>
			</div>

			<p style="font-size: 25px; border:3px; border-style:solid; border-color:#A2DAFF; padding: 0.3em;">${this.situation}</p>

			<div id='prompt2'>
			<p style="font-size:25px"> Based on those above (we name them <b>"context"</b>), ask a question about the 3D scene and answer it, then click 'Submit'. </p>

			<p style="font-size:25px"><b>Assignment with questions that can be answered without considering the context will be <span style="color:red; font-size:25px">rejected</span></b>.</p>
			<p> -- How many chairs are there in the room? <span style=\"color: red\"><b>×</b></span></p>
			<p> -- Is the amount of monitors on the desk I'm facing at odd or even? <span style=\"color: green\"><b>√</b></span></p>

			<p style="font-size:25px"><b>Assignment with questions that can be answered by merely reading the description (no need to look at the 3D scene) will be <span style="color:red; font-size:25px">rejected</span></b>.</p>

			<p style="font-size:25px"><b>You may ask at most <span style="color:red; font-size:25px">3</span> "simple" questions ((you need to ask <span style="color:red; font-size:25px">5</span> questions in total) as we encourage creative questions; otherwise your assignment will be <span style="color:red; font-size:25px">rejected</span>. Questions below are viewed as "simple":</b></p>
			<p> - Questions about simple object category/property or counting, ex. Is there a chair on my 6 o\'clock direction?; What is the color of the table on my right?; How many chairs are there behine me? </p>
			<p> - Questions that repeat the same pattern</p>
			<p> - Questions that can be answered with "Yes" or "No" (Note: some creative questions can also have answer "yes" or "no", but you still need to control the overall amount of questions with answer "yes" or "no" in your assignment) </p>
			</div>
		</div>
		<div>
			<label style="font:35px bold">Question</label>
			<p style="display:inline; color:blue"> --- It is expected to be a sentence.</p>
			<input type="text" class="form-control" id="sqa_question" placeholder="How many chairs are there behind me?" required=""></input>
		</div>
		<div>
			<label style="font:35px bold">Answer</label><p style="display:inline; color:blue"> --- It is expected to be a <span style="color:blue; font-size:25px"> simple word</span>. Bad example: <b>two o'clock direction</b> (you should avoid question with answer like this); <b>two coffee tables</b> (just "coffee table" will be OK); <b>turn around and walk to the left</b> (just "backward" will be OK)</p>
			<input type="text" class="form-control" id="sqa_answer" placeholder="three" required=""></input>
		</div>

		</div>
			<p style="display:inline; font-size:25px"> Please repeat <b>Step 2</b> for <b>${this.max_response}</b> times.</p>
		<div>
		<h2><hr/></h2>

		<div id='limit'>
		</div>

		<div id='confirmation'>
		</div>

		<button id="btn_sqa_submit" class="w-100 btn btn-primary btn-lg" type="submit">Submit</button>
		`;

		this.btn.sqa_submit = document.getElementById("btn_sqa_submit");
		this.add_listener(this.btn.sqa_submit, "click", this.on_click_btn_sqa_submit_qaonly);

		// load agent pose
		this.load_arrow_pose(this.agent_pos, this.agent_rot);

		this.arrow_controls.enabled = false;
		this.arrow_drag_controls.enabled = false;

		this.render_limit(this.max_response, this.cur_response);
		if (this.cur_response >= this.max_response) {
			this.render_confirmation_code();
		}
	}

	on_click_btn_sqa_submit_qaonly() {
		var question = document.getElementById("sqa_question").value;
		var answer = document.getElementById("sqa_answer").value;

		if (!question || !answer) {
			alert("Failed. Please fill in the text box!");
		}
		else if (question == this.prev_submitted_q){
			alert("Failed. You cannot submit the same question again!");
		}
		else if (this.cur_response >= this.max_response) {
			alert("Failed. You already met the required amount of responses.");
		}
		else {
			var record = new Object();
			record.scene_id = this.resources.scene_id;
			var pos = new THREE.Vector3()
			pos = this.arrow.getWorldPosition(pos);
			record.agent_pos = pos;
			record.agent_rot = this.arrow.quaternion;
			record.situation = this.situation;
			record.question = question;
			record.answer = answer;
			record.hash1 = this.hash1;
			record.hash2 = this.hash2;
			record.task_db = this.task_db;
			window.xhr_post(JSON.stringify(record), "/apps/database/sqa3d/save/sqa_collection={0}".format(this.resources.sqa_db_collection_name)).then(() => {
				console.log("inserted qa!");
				this.cur_response += 1;
				alert(["Recorded.", question, answer].join(' '));
				this.prev_submitted_q = question;
				this.render_limit(this.max_response, this.cur_response);
				if (this.max_response <= this.cur_response) {
					this.render_confirmation_code();
				}
			});
		}
	}
	//////////////////////////


	//////////////////////// stage 3: human study
	setup_prompt_aonly() {
		this.container.innerHTML = `
		<h1><hr/></h1>
		<div>
			<label style="font: 45px bold">Step 1</label>
			<p style="display: inline; font-size: 25px"> Explore the 3D scene above. Click 'Tutorial' for details on how to interact with the scene and objects.</p>
		</div>
		<h2><hr/></h2>

		<div>
			<label style="font:45px bold">Step 2</label>
			<p style="display:inline; font-size:25px"> Imagine your location now is the same as the the <span style='color: green'>green arrow</span> in the scene, and you are facing towards the same direction it points at. The following describes your current <b>status</b>:</p>

			<p style="font-size: 25px; border:3px; border-style:solid; border-color:#A2DAFF; padding: 0.3em;">${this.situation}</p>

			<p style="font-size:25px"> Based on those (we name them <b>"context"</b>) above, answer the following question, then click 'Submit'.</p>

			<p style="font-size: 25px; border:3px; border-style:solid; border-color:#BAE8B9; padding: 0.3em;">${this.question}</p>

			<label style="font:35px bold">Answer</label><p style="display:inline; color:blue"> --- It is expected to be a <span style="color:blue; font-size:25px"> simple word</span>.</p>
			<input type="text" class="form-control" id="sqa_answer" placeholder="three" required=""></input>
		</div>
		<h2><hr/></h2>

		<div id='limit'>
		</div>

		<div id='confirmation'>
		</div>

		<button id="btn_sqa_submit" class="w-100 btn btn-primary btn-lg" type="submit">Submit</button>
		`;

		this.btn.sqa_submit = document.getElementById("btn_sqa_submit");
		this.add_listener(this.btn.sqa_submit, "click", this.on_click_btn_sqa_submit_aonly);

		// load agent pose
		this.load_arrow_pose(this.agent_pos, this.agent_rot);

		this.arrow_controls.enabled = false;
		this.arrow_drag_controls.enabled = false;

		this.max_response = 1;
		if (this.cur_response >= this.max_response) {
			this.render_confirmation_code();
		}
	}

	on_click_btn_sqa_submit_aonly() {
		var answer = document.getElementById("sqa_answer").value;

		if (!answer) {
			alert("Failed. Please fill in the text box!");
		}
		else if (this.cur_response >= this.max_response) {
			alert("Failed. You already met the required amount of responses.");
		}
		else {
			var record = new Object();
			record.scene_id = this.resources.scene_id;
			var pos = new THREE.Vector3()
			pos = this.arrow.getWorldPosition(pos);
			record.agent_pos = pos;
			record.agent_rot = this.arrow.quaternion;
			record.situation = this.situation;
			record.question = this.question;
			record.answer = answer;
			record.hash1 = this.hash1;
			record.hash2 = this.hash2;
			record.task_db = this.task_db;
			window.xhr_post(JSON.stringify(record), "/apps/database/sqa3d/save/sqa_collection={0}".format(this.resources.sqa_db_collection_name)).then(() => {
				console.log("inserted a!");
				this.cur_response += 1;
				alert("Recorded.");
				if (this.max_response <= this.cur_response) {
					this.render_confirmation_code();
				}
			});
		}
	}

	/////////////////////////////////////

	//////////////////////// stage 3.1: human study (bundled)
	setup_prompt_aonly_bundled() {
		this.container.innerHTML = `
		<h1><hr/></h1>
		<div>
			<label style="font: 45px bold">Step 1</label>
			<p style="display: inline; font-size: 25px"> Explore the 3D scene above. Click 'Tutorial' for details on how to interact with the scene and objects.</p>
		</div>
		<h2><hr/></h2>

		<div>
			<label style="font:45px bold">Step 2</label>
			<p style="display:inline; font-size:25px"> Imagine your location now is the same as the the <span style='color: green'>green arrow</span> in the scene, and you are facing towards the same direction it points at. The following describes your current <b>status</b>:</p>

			<p id="situation" style="font-size: 25px; border:3px; border-style:solid; border-color:#A2DAFF; padding: 0.3em;"></p>

			<p style="font-size:25px"> Based on those (we name them <b>"context"</b>) above, answer the following question, then click 'Submit'.</p>

			<p id="question" style="font-size: 25px; border:3px; border-style:solid; border-color:#BAE8B9; padding: 0.3em;"></p>

			<label style="font:35px bold">Answer</label><p style="display:inline; color:blue"> --- It is expected to be a <span style="color:blue; font-size:25px"> simple word</span>.</p> <p style="display:inline; color:red; font-size:25px"><b> Never answering like "not visible". You should navigate & interact with the environment and try to provide your best guess.</b><p>
			<input type="text" class="form-control" id="sqa_answer" placeholder="three" required=""></input>

			<label style="font:35px bold">Are you confident with your answer?</label>

			<br>
			<div class='radio-confidence'>
			<div class="form-check form-check-inline">
				<input class="form-check-input" type="radio" name="answer_confidence" id="answer_confidence_yes">
				<label class="form-check-label" for="answer_confidence_yes">Yes</label>
			</div>

			<div class="form-check form-check-inline">
				<input class="form-check-input" type="radio" name="answer_confidence" id="answer_confidence_maybe">
				<label class="form-check-label" for="answer_confidence_maybe">Maybe</label>
			</div>

			<div class="form-check form-check-inline">
				<input class="form-check-input" type="radio" name="answer_confidence" id="answer_confidence_no">
				<label class="form-check-label" for="answer_confidence_no">No</label>
			</div>
			</div>

		</div>
		<h2><hr/></h2>

		<div id='limit'>
		</div>

		<div id='confirmation'>
		</div>

		<button id="btn_sqa_submit" class="w-100 btn btn-primary btn-lg" type="submit">Submit</button>
		`;

		this.btn.sqa_submit = document.getElementById("btn_sqa_submit");
		this.add_listener(this.btn.sqa_submit, "click", this.on_click_btn_sqa_submit_aonly_bundled);

		// load agent pose
		if (this.cur_response < this.max_response) {
			this.load_arrow_pose(this.agent_pos[this.cur_response], this.agent_rot[this.cur_response]);
			this.cur_situation = this.situation[this.cur_response];
			this.cur_question = this.question[this.cur_response];
			document.getElementById("situation").innerHTML = this.cur_situation;
			document.getElementById("question").innerHTML = this.cur_question;
		}

		this.arrow_controls.enabled = false;
		this.arrow_drag_controls.enabled = false;

		this.render_limit(this.max_response, this.cur_response);
		if (this.cur_response >= this.max_response) {
			this.render_confirmation_code();
		}
	}

	on_click_btn_sqa_submit_aonly_bundled() {
		var answer = document.getElementById("sqa_answer").value;

		var conf_yes = document.getElementById("answer_confidence_yes").checked;
		var conf_maybe = document.getElementById("answer_confidence_maybe").checked;
		var conf_no = document.getElementById("answer_confidence_no").checked;

		if (!answer) {
			alert("Failed. Please fill in the text box!");
		}
		else if (this.cur_response >= this.max_response) {
			alert("Failed. You already met the required amount of responses.");
		}
		else if (conf_yes == false && conf_no == false && conf_maybe == false) {
			alert('Please select your confidence of the answer!');
		}
		else {
			var answer_confidence = 'undefined';
			if (conf_yes) {
				answer_confidence = 'yes';
			}
			else if (conf_maybe) {
				answer_confidence = 'maybe';
			}
			else if (conf_no) {
				answer_confidence = 'no';
			}

			var record = new Object();
			record.scene_id = this.resources.scene_id;
			var pos = new THREE.Vector3()
			pos = this.arrow.getWorldPosition(pos);
			record.agent_pos = pos;
			record.agent_rot = this.arrow.quaternion;
			record.situation = this.situation[this.cur_response];
			record.question = this.question[this.cur_response];
			record.answer = answer;
			record.answer_confidence = answer_confidence;
			record.hash1 = this.hash1;
			record.hash2 = this.hash2;
			record.task_db = this.task_db;
			window.xhr_post(JSON.stringify(record), "/apps/database/sqa3d/save/sqa_collection={0}".format(this.resources.sqa_db_collection_name)).then(() => {
				console.log("inserted a!");
				this.cur_response += 1;
				alert("Recorded.");
				this.render_limit(this.max_response, this.cur_response);
				if (this.max_response <= this.cur_response) {
					this.render_confirmation_code();
				}
				else {
					this.load_arrow_pose(this.agent_pos[this.cur_response], this.agent_rot[this.cur_response]);
					this.cur_situation = this.situation[this.cur_response];
					this.cur_question = this.question[this.cur_response];
					document.getElementById("situation").innerHTML = this.cur_situation;
					document.getElementById("question").innerHTML = this.cur_question;
					document.getElementById("sqa_answer").value = "";
				}
				document.getElementById("answer_confidence_yes").checked = false;
				document.getElementById("answer_confidence_maybe").checked = false;
				document.getElementById("answer_confidence_no").checked = false;
			});
		}
	}

	/////////////////////////////////////


	init_camera() {
		let radius = this.scene_geometry.boundingSphere.radius + 2;
		let init_pos = new THREE.Vector3(0, -radius, radius);
		let lookat = new THREE.Vector3(0, 0, 0);
		let up = new THREE.Vector3(0, 0, 1);
		this.window_mesh.set_view(init_pos, up, lookat);
	}

	center_camera() {
		// the camera moves along the surface of a sphere
		let posx = this.window_mesh.camera.position.x;
		let posy = this.window_mesh.camera.position.y;
		let posz = this.window_mesh.camera.position.z;
		let r2 = posx*posx+posy*posy+posz*posz;
		let tau = 0.002;
		let ratio = posx/posy;
		if (posy < 0) {
			posy = -tau;
		}
		else {
			posy = tau;
		}
		posx = ratio * posy;
		posz = Math.sqrt(r2 - posx*posx+posy*posy);

		this.window_mesh.camera.position.set(posx, posy, posz);
        this.window_mesh.navigation.update()
        this.window_mesh.camera.updateMatrixWorld(true);
	}

	lookat_arrow_camera() {
		this.arrow.updateMatrixWorld(true);
		let up = new THREE.Vector3(0, 0, 1);
		let lookat = Object.assign({}, this.arrow.position);
		let dummy = new THREE.Vector3();

		let arrow_orinetation_x = this.cone.getWorldPosition(dummy).x - this.cylinder.getWorldPosition(dummy).x;
		let arrow_orinetation_y = this.cone.getWorldPosition(dummy).y - this.cylinder.getWorldPosition(dummy).y;

		let radius = this.scene_geometry.boundingSphere.radius + 2;
		let z = radius * 0.8;

		if (arrow_orinetation_y === 0) {
			var y = 0;
			var x = Math.sqrt(radius*radius-z*z) * Math.sign(arrow_orinetation_x);
		}
		else {
			let ratio = arrow_orinetation_x / arrow_orinetation_y;
			var y = Math.sqrt((radius*radius-z*z)/(1+ratio*ratio)) * Math.sign(arrow_orinetation_y);
			var x = ratio * y;
		}

		let init_pos = new THREE.Vector3(-x+this.arrow.position.x, -y+this.arrow.position.y, z+this.arrow.position.z);
		this.window_mesh.set_view(init_pos, up, lookat);
	}

	init_object_hex() {
		// init color
		for (let i = 0; i < this.object_mesh.length; i++) {
			this.object_mesh[i].material.emissive.setHex(this.object_hexs[this.resources.scene_object_id[i]]);
		}
	}

	/********************************************
	 *************     renderers    *************
	 ********************************************/

	render() {
		this.stats.begin();
		// set current camera
		// this.add_mesh(this.window_mesh.camera, [this.camera_light]);
		// let closest_pose = this.get_closest_pose();
		// let nav_vector = new THREE.Vector3();
		// this.window_mesh.camera.getWorldDirection(nav_vector);
		// highlight the intersected object
		this.get_intersection();
		// render
		// if (this.preload_complete) this.render_frame(closest_pose);

		// enable arrow control and set the moving speed
		this.arrow_controls.update(0.2);
		this.renderer.render(this.scene, this.window_mesh.camera);
		this.window_mesh.advance(0, 8);
		this.stats.end();

		requestAnimationFrame(this.render.bind(this));
	}

	// render_scene_select() {
	// 	let all_scenes = ["Select a scene"];
	// 	let scene_list = all_scenes.concat(this.scene_list);
	// 	for (let i = 0; i < scene_list.length; i++) {
	// 		let option = document.createElement("option");
	// 		option.value = scene_list[i];
	// 		option.style.fontSize = "16px";
	// 		option.innerHTML = scene_list[i];
	// 		this.select.scene.appendChild(option);
	// 	}
	// 	// add listener
	// 	this.add_listener(document.getElementById("submit_view"), "click", this.on_submit_view);
	// }

	// render_frame(pose) {
	// 	// show frame
	// 	// let index = pose.index;
	// 	// let img_url = path.join("/apps/resource/frame/", this.resources.scene_id, pose.index + ".jpg");
	// 	// document.getElementById("image").src = img_url;
	// 	try {
	// 		document.getElementById("image").src = this.resources.preload_frames[this.selected_id][pose.index].src;
	// 	}
	// 	catch (err) {
	// 		console.log("invalid frame")
	// 	}
	// 	// // show vitual camera
	// 	// if (this.camera_flag) {
	// 	// 	// this.scene.remove(this.camera_mesh);
	// 	// 	this.remove_mesh(this.scene, [this.camera_mesh]);
	// 	// }

	// 	// this.camera_mesh = new THREE.Mesh(this.camera_geometry, new THREE.MeshStandardMaterial( { color: 0x666666 } ));
	// 	// this.camera_mesh.applyMatrix(pose.pose);
	// 	// this.camera_mesh.scale.set(0.4, 0.4, 0.4);
	// 	// this.camera_mesh.position.x -= this.scene_geometry_center.x;
	// 	// this.camera_mesh.position.y -= this.scene_geometry_center.y;
	// 	// this.camera_mesh.position.z -= this.scene_geometry_center.z;
	// 	// // this.scene.add(this.camera_mesh);
	// 	// this.add_mesh(this.scene, [this.camera_mesh]);
	// 	// this.camera_flag = true;
	// }

	render_annotation_results() {
		window.xhr_json("GET", path.join("/apps/database/mesh2cap/query", this.resources.scene_id, this.selected_id, "-1")).then(results => {
			let bg_palette = {
				0: "#ebf8ff",
				1: "#cce5f1"
			};
			let data = results.data;
			let view_ui = document.getElementById("ViewUI");
			if (view_ui.hasChildNodes()) while (view_ui.firstChild) view_ui.removeChild(view_ui.firstChild);
			if (data.length > 0) {
				for (let i = 0; i < data.length; i++) {
					let view_container = document.createElement("tr");
					view_container.style.width = "100%";
					view_ui.appendChild(view_container);
					ReactDOM.render(<ViewUI bg={bg_palette[i % 2]} object_id={data[i].object_id} anno_id={data[i].anno_id} ann_worker_id={data[i].annotate.worker_id} ver_worker_id={data[i].verify.worker_id} status={data[i].status} description={data[i].description} />, view_container, function () {
						this.btn["view_" + data[i].object_id + "_" + data[i].anno_id] = document.getElementById("view_" + data[i].object_id + "_" + data[i].anno_id);
						this.btn["scene_" + data[i].object_id + "_" + data[i].anno_id] = document.getElementById("scene_" + data[i].object_id + "_" + data[i].anno_id);
						this.add_listener(this.btn["view_" + data[i].object_id + "_" + data[i].anno_id], "click", this.on_click_operation, "view_" + data[i].object_id + "_" + data[i].anno_id);
						this.add_listener(this.btn["scene_" + data[i].object_id + "_" + data[i].anno_id], "click", this.on_click_operation, "scene_" + data[i].object_id + "_" + data[i].anno_id);

						// this.btn["comment_"+data[i].object_id+"_"+data[i].anno_id] = document.getElementById("comment_"+data[i].object_id+"_"+data[i].anno_id);
						// if (data[i].verify.comment || data[i].verify.reworded) {
						// 	// this.visible_popover = new Object();
						// 	// $("comment_"+data[i].object_id+"_"+data[i].anno_id).popover({trigger: "focus"})
						// 	this.add_listener(this.btn["comment_"+data[i].object_id+"_"+data[i].anno_id], "click", this.on_click_comment, "comment_"+data[i].object_id+"_"+data[i].anno_id+"_"+data[i].verify.comment+"|"+data[i].verify.reworded);

						// }
						// else {
						// 	// this.btn["comment_"+data[i].object_id+"_"+data[i].anno_id].disabled = true;
						// 	let class_ = this.btn["comment_"+data[i].object_id+"_"+data[i].anno_id].getAttribute("class");
						// 	this.btn["comment_"+data[i].object_id+"_"+data[i].anno_id].setAttribute("class", class_+" disabled")
						// }
						// $(".popover-dismiss").popover({trigger: 'focus'});
					}.bind(this));
				}
			}
		});
	}

	render_canvas_label(x, y) {
		if (document.getElementById("canvas_label_div")) document.getElementById("id_div_root").removeChild(this.canvas_label);

		this.canvas_label = document.createElement("div");
		this.canvas_label.id = "canvas_label_div";
		this.canvas_label.style.position = "absolute";
		this.canvas_label.style.left = x + "px";
		this.canvas_label.style.top = y + "px";
		this.canvas_label.style.backgroundColor = "white";
		this.canvas_label.innerHTML = this.intersected_name;
		document.getElementById("id_div_root").appendChild(this.canvas_label);
	}

	render_label_list() {
		// add instances
		// console.log(this.datasettype)
		console.log(this.scenegraph)
		var tmp = new Object();
		for (let i = 0; i < this.resources.scene_object_name.length; i++) {
			var oname = '';
			if (!this.resources.scene_object_name[i]) {
				//console.log("oname", oname)
				oname = '';
			} else {
				oname = this.resources.scene_object_name[i];
			}
			// console.log("oname", oname, "this.resources.scene_object_id[i]", this.resources.scene_object_id[i])
			// console.log(typeof this.resources.scene_object_id[i])

			if (this.datasettype['type'] == 0){
				//console.log(this.resources.scene_object_id[i])
				this.all_object_info = this.scenegraph[this.resources.scene_id]['objects_info']
				for (let obj_id_var = 0; obj_id_var < this.all_object_info.length; obj_id_var++){
					//console.log(String(this.all_object_info[obj_id_var]['id']) == this.resources.scene_object_id[i])
					// console.log(typeof this.all_object_info[obj_id_var]['id'])
					if (this.all_object_info[obj_id_var]['id'] == this.resources.scene_object_id[i]){
						this.selected_object_info = this.all_object_info[obj_id_var];
						break;
					}
				}
				this.selected_object_label = this.selected_object_info['label']
				this.selected_object_size = this.selected_object_info['size']
				//console.log("selected_object_label",this.selected_object_label)
				//const power_factor = 100
				this.selected_object_width = Math.round(this.selected_object_size[0] * 100)/100
				this.selected_object_length = Math.round(this.selected_object_size[1] * 100)/100
				this.selected_object_height = Math.round(this.selected_object_size[2] * 100)/100
				//console.log(this.selected_object_width)
				//console.log(this.selected_object_length)
				//console.log(this.selected_object_height)
				//console.log(typeof this.resources.scene_object_id[i])

			} else if (this.datasettype['type'] == 1){
				//console.log(this.resources.scene_object_id[i])
				this.all_object_info = this.scenegraph[this.resources.scene_id]['objects_info']
				//console.log(this.all_object_info)
				for (let obj_id_var = 0; obj_id_var < this.all_object_info.length; obj_id_var++){
					//console.log(String(this.all_object_info[obj_id_var]['id']) == this.resources.scene_object_id[i])
					// console.log(typeof this.all_object_info[obj_id_var]['id'])
					if (this.all_object_info[obj_id_var]['id'] == (Number(this.resources.scene_object_id[i]) + 1)){
						this.selected_object_info = this.all_object_info[obj_id_var];
						//console.log(this.selected_object_info)
						break;
					}
				}
				this.selected_object_label = this.selected_object_info['label']
				this.selected_object_size = this.selected_object_info['size']
				//console.log("selected_object_label",this.selected_object_label)
				//const power_factor = 100
				this.selected_object_width = Math.round(this.selected_object_size[0] * 100)/100
				this.selected_object_length = Math.round(this.selected_object_size[1] * 100)/100
				this.selected_object_height = Math.round(this.selected_object_size[2] * 100)/100
				//console.log(this.selected_object_width)
				//console.log(this.selected_object_length)
				//console.log(this.selected_object_height)
				//console.log(typeof this.resources.scene_object_id[i])

			} else if (this.datasettype['type'] == 2){
				//console.log(this.resources.scene_object_id[i])
				this.all_object_info = this.scenegraph[this.resources.scene_id]['objects_info']
				//console.log(this.all_object_info)
				// for (let obj_id_var = 0; obj_id_var < this.all_object_info.length; obj_id_var++){
				// 	if (this.all_object_info[obj_id_var]['id'] == (Number(this.resources.scene_object_id[i]) + 1)){
				// 		this.selected_object_info = this.all_object_info[obj_id_var];
				// 		break;
				// 	}
				// }
				this.selected_object_info = this.all_object_info[Number(this.resources.scene_object_id[i])]
				this.selected_object_label = this.selected_object_info['label']
				this.selected_object_size = this.selected_object_info['size']
				//console.log("selected_object_label",this.selected_object_label)
				//const power_factor = 100
				this.selected_object_width = Math.round(this.selected_object_size[0] * 100)/100
				this.selected_object_length = Math.round(this.selected_object_size[1] * 100)/100
				this.selected_object_height = Math.round(this.selected_object_size[2] * 100)/100
				//console.log(this.selected_object_width)
				//console.log(this.selected_object_length)
				//console.log(this.selected_object_height)
				//console.log(typeof this.resources.scene_object_id[i])

			}


			if (oname in tmp) {
				
				tmp[oname].push(this.resources.scene_object_id[i] + ' ' + String(this.selected_object_width) + " " + String(this.selected_object_length) + " " + String(this.selected_object_height));
				//tmp[oname].push(this.resources.scene_object_id[i]);

			}
			else {
				tmp[oname] = [this.resources.scene_object_id[i] + ' ' + String(this.selected_object_width) + " " + String(this.selected_object_length) + " " + String(this.selected_object_height)]
				//tmp[oname] = [this.resources.scene_object_id[i]];
			}
			
		}
		//console.log("tmp", tmp)
		var list_tmp = Object.entries(tmp);
		//console.log("list_tmp", list_tmp)
		list_tmp.sort(function (a, b) {
			//console.log("a",a)
			//console.log("b",b)
			return ('' + a[0]).localeCompare(b[0]);
		})
		//console.log("after sorting", list_tmp)

		for (let i = 0; i < list_tmp.length; i++) {
			let object_id = list_tmp[i][1][0].split(" ")[0];
			//console.log(object_id)
			//console.log(this.object_dict[object_id].name.toString())
			var new_list_tmp_obj = []
			var new_list_tmp_obj_size = []
			for (let new_obj_id = 0; new_obj_id < list_tmp[i][1].length; new_obj_id++){
				new_list_tmp_obj.push(list_tmp[i][1][new_obj_id].split(' ')[0])
				new_list_tmp_obj_size.push([list_tmp[i][1][new_obj_id].split(' ')[1], list_tmp[i][1][new_obj_id].split(' ')[2], list_tmp[i][1][new_obj_id].split(' ')[3]])
			}
			//console.log(new_list_tmp_obj)
			//console.log(new_list_tmp_obj_size)

			//console.log("this.object_dict[object_id].name.toString()", this.object_dict[object_id].name.toString())
			//console.log(list_tmp[i][1])
			var ret = utils.add_instance_label_no_color(document, this.label_container, this.resources.palette, this.object_dict[object_id].name.toString(), new_list_tmp_obj, list_tmp[i][1].length, new_list_tmp_obj_size);
			//var ret = utils.add_instance_label_no_color(document, this.label_container, this.resources.palette, this.object_dict[object_id].name.toString(), list_tmp[i][1], list_tmp[i][1].length);
			var parent_id = ret[0];
			var child_ids = ret[1];
			//console.log("parent_id",parent_id)
			//console.log("child_ids",child_ids)
			this.object_label_dict[parent_id] = child_ids;
			
		}
		this.hid_all_child_label();
	}

	render_label_color(visible) {
		let labels = document.getElementById("label_container").childNodes;
		for (let label_id = 0; label_id < labels.length; label_id++) {
			let cur_id = labels[label_id].id;
			let cur_label = document.getElementById(cur_id);
			let cur_color_div = document.getElementById(cur_label.childNodes[0].id);
			let object_id = cur_color_div.id.split("_").slice(-1)[0]
			let cur_color_idx = document.getElementById("color_idx_" + object_id);
			this.annotation_info[object_id] = {
				major_color: "rgb(200, 200, 200)",
				num_anno: "0"
			}
			window.xhr_json("GET", path.join("/apps/database/mesh2cap/query", this.resources.scene_id, object_id, "-1")).then(results => {
				this.render_label_color_div(cur_color_div, cur_color_idx, results, object_id);
			});
		}
	}

	render_label_color_div(color_div, color_idx, record, object_id) {
		let info = this.get_annotation_info(record);
		color_div.style.backgroundColor = info.major_color;
		color_idx.innerHTML = info.num_anno;
		this.annotation_info[object_id].major_color = info.major_color;
		this.annotation_info[object_id].num_anno = info.num_anno;
	}

	render_mesh_none() {
		this.scene_mesh.material = new THREE.MeshStandardMaterial({ color: 0xbcbcbc, metalness: 0.0 });
		for (let i = 0; i < this.object_mesh.length; i++) {
			this.object_mesh[i].material = new THREE.MeshStandardMaterial({ color: 0xbcbcbc, metalness: 0.0 });
		}
	}

	render_mesh_surface() {
		this.scene_mesh.material = new THREE.MeshStandardMaterial({ vertexColors: THREE.VertexColors, metalness: 0.0 });
		for (let i = 0; i < this.object_mesh.length; i++) {
			this.object_mesh[i].material = new THREE.MeshStandardMaterial({ vertexColors: THREE.VertexColors, metalness: 0.0 });
		}
	}

	render_mesh_annotated() {
		this.scene_mesh.material = new THREE.MeshStandardMaterial({ color: 0xbcbcbc, metalness: 0.0, transparent: true, opacity: 0.1 });
		// let annotation_info_keys = Object.keys(this.annotation_info);
		for (let i = 0; i < this.object_mesh.length; i++) {
			// this.object_mesh[i].material = new THREE.MeshStandardMaterial( { color: this.annotation_info[annotation_info_keys[i]].major_color, metalness: 0.0 } );
		}
	}

	/********************************************
	 *************       Utils      *************
	 ********************************************/

	get_resource(params) {
		console.log("params",params)
		this.resources = new Object();
		this.resources.datasetname = params.datasetname
		this.resources.scene_id = params.scene_id;
		this.resources.scene_list = params.scene_list
		this.resources.referring_expressions_id = params.referring_expressions_id
		this.resources.scene_object = params.scene_object;
		this.resources.scene_object_id = this.get_scene_object_id();
		this.resources.scene_object_name = this.get_scene_object_name();
		this.resources.scene_object_dict = this.get_scene_object_dict();
		this.resources.scene_mesh = this.resources.scene_id + "_vh_clean_2.ply";
		this.resources.scenegraph = "objects.json"
		this.resources.datasettype = 'type.json'
		this.resources.referring_expressions = "referring_expressions.json"
		// this.resources.scene_mesh = this.resources.scene_id + "_vh_clean.ply";
		// this.resources.instance_aggr = this.resources.scene_id + ".aggregation.json";
		this.resources.frames = "color";
		this.resources.poses = "pose";
		this.resources.palette = this.get_instance_palette();
		//console.log("printing resoureces.scene_object")
		//console.log(this.resources.scene_object);

		this.resources.sqa_db_collection_name = params.sqa_db_collection_name;

		/////////////////////////////////
		// Task related
		this.hash1 = params.hash1;
		this.hash2 = params.hash2;
		this.task_db = params.task_db;
		this.task_type = params.task_type;
		this.max_response = params.max_response;
		this.cur_response = params.cur_response;
		this.agent_rot = params.agent_rot;
		this.agent_pos = params.agent_pos;
		this.situation = params.situation;
		this.question = params.question;
		/////////////////////////////////
	}

	get_scene_object_id() {
		let scene_object_id = new Array();
		for (let i = 0; i < this.resources.scene_object.length; i++) {
			scene_object_id.push(this.resources.scene_object[i].split(".")[0].split("_")[0])
			//console.log(this.resources.scene_object[i].split(".")[0].split("_")[0])
		}
		//console.log("scene_object_id", scene_object_id)

		return scene_object_id;
	}

	get_scene_object_name() {
		let scene_object_name = new Array();
		for (let i = 0; i < this.resources.scene_object.length; i++) {
			scene_object_name.push(this.resources.scene_object[i].split(".")[0].split("_").slice(1).join(" "))
			//console.log(this.resources.scene_object[i].split(".")[0].split("_").slice(1).join(" "))
		}

		//console.log("scene_object_name", scene_object_name)
		return scene_object_name;
	}

	get_scene_object_dict() {
		let scene_object_dict = new Object();
		for (let i = 0; i < this.resources.scene_object_id.length; i++) {
			scene_object_dict[this.resources.scene_object_id[i]] = this.resources.scene_object_name[i];
		}

		return scene_object_dict;
	}

	get_instance_palette() {
		let palette = nyuv2.create_palette();
		let instance_palette = new Array();
		for (let i = 0; i < this.resources.scene_object.length; i++) {
			instance_palette.push(palette[i % palette.length]);
		}

		return instance_palette;
	}

	// get_frame_indices() {
	// 	// let new_indices = [];
	// 	// let cur_index = 0;
	// 	// while (true) {
	// 	// 	if (cur_index >= this.resources.scene_frame.length) {
	// 	// 		break;
	// 	// 	}
	// 	// 	else {
	// 	// 		new_indices.push(parseInt(this.resources.scene_frame[cur_index]));
	// 	// 		cur_index += this.interval;
	// 	// 	}
	// 	// }

	// 	let new_indices = new Object();
	// 	let max_len = 200;
	// 	new_indices["-1"] = new Array();
	// 	this.num_frames = 0
	// 	for (let i = 0; i < this.resources.scene_object_id.length; i++) {
	// 		let indices = this.object_gallery[parseInt(this.resources.scene_object_id[i])].slice(0, max_len);
	// 		new_indices[this.resources.scene_object_id[i]] = indices
	// 		new_indices["-1"].push(...indices.slice(0, 10));
	// 		this.num_frames += indices.length;
	// 		this.num_frames += indices.slice(0, 10).length;
	// 	}

	// 	return new_indices;
	// }

	// get_closest_pose() {
	// 	// decode the current camera rotation vector
	// 	let cur_rotation_vector = new THREE.Vector3();
	// 	this.window_mesh.camera.getWorldDirection(cur_rotation_vector);
	// 	// get the closest camera pose
	// 	let closest_pose = new Object();
	// 	closest_pose.index = 0;
	// 	closest_pose.angle = Infinity;
	// 	closest_pose.pose = this.poses[0];
	// 	for (let i = 0; i < this.indices[this.selected_id].length; i++) {
	// 		try {
	// 			// decode the frame camera rotation vector
	// 			let pose_rotation = new THREE.Matrix4()
	// 			pose_rotation.extractRotation(this.poses[this.indices[this.selected_id][i]])
	// 			let pose_rotation_vector = (new THREE.Vector3(0, 0, 1)).applyMatrix4(pose_rotation)
	// 			let rotation_angle = (pose_rotation_vector).angleTo(cur_rotation_vector);

	// 			if (rotation_angle < closest_pose.angle) {
	// 				closest_pose.angle = rotation_angle;
	// 				closest_pose.index = this.indices[this.selected_id][i];
	// 				closest_pose.pose = this.poses[this.indices[this.selected_id][i]];
	// 			}
	// 		}
	// 		catch(err) {}
	// 	}
	// 	return closest_pose;
	// }

	get_object_center(geometry) {
		return geometry.boundingSphere.center;
	}

	get_annotation_info(record) {
		let status_count = {
			unverified: 0,
			verified: 0
		}
		let status_palette = {
			unverified: "rgb(240, 173, 78)",
			verified: "rgb(92, 193, 61)",
		}
		let annotation_info = {
			major_color: "rgb(200, 200, 200)",
			num_anno: "0"
		}
		if (record.data.length > 0) {
			for (let i = 0; i < record.data.length; i++) {
				status_count[record.data[i].status]++;
			}
			let major_status = Object.keys(status_count).reduce((a, b) => status_count[a] > status_count[b] ? a : b);
			let total_anno = Object.values(status_count).reduce((a, b) => a + b);
			annotation_info.major_color = status_palette[major_status];
			annotation_info.num_anno = total_anno.toString();
		}

		return annotation_info
	}

	get_intersection() {
		if (this.window_mesh.is_mouse_in_model_panel()) {
			this.raycaster.setFromCamera(this.window_mesh.pos_mouse, this.window_mesh.camera);
			let intersected = this.raycaster.intersectObjects(this.scene.children.slice(4));
			let ignore_list = [0x218838, 0xff0000, 0xffc107]
			if (intersected.length > 0) {
				if (!(ignore_list.includes(intersected[0].object.material.emissive.getHex()))) {
					// if (this.intersected) this.intersected.material.emissive.setHex(this.intersected.currentHex);
					// this.intersected = intersected[0].object;
					// this.intersected.currentHex = this.intersected.material.emissive.getHex();
					// this.intersected.material.emissive.setHex(0x0059ff);
					// this.instance_id = parseInt(this.intersected.name.split("_")[0]);
					// this.intersected_name = this.intersected.name;

					// highlight all objects with the same name instead
					if (this.intersected) {
						for (let i = 0; i < this.intersected.length; ++i) {
							this.intersected[i].material.emissive.setHex(this.intersected[i].currentHex);
						}
					}
					// console.log(intersected[0].object.name);
					this.intersected = [intersected[0].object];
					this.intersected[0].currentHex = this.intersected[0].material.emissive.getHex();
					this.intersected[0].material.emissive.setHex(0x0059ff);
					this.instance_id = parseInt(this.intersected[0].name.split("_")[0]);
					this.intersected_name = this.intersected[0].name;
				}
			}
			else {
				// if (this.intersected) this.intersected.material.emissive.setHex(this.intersected.currentHex);
				// this.intersected = null;
				// this.instance_id = -1;

				// highlight all objects with the same name instead
				if (this.intersected) {
					for (let i = 0; i < this.intersected.length; ++i) {
						this.intersected[i].material.emissive.setHex(this.intersected[i].currentHex);
					}
				}
				this.intersected = null;
				this.instance_id = -1;
			}
		}
	}

	// set_preloading_progress(progress) {
	// 	let frame_loading_bar = document.getElementById("frame_loading_bar");
	// 	let frame_loading_progress = document.getElementById("frame_loading_progress");
	// 	frame_loading_bar.style.width = progress + "%";
	// 	frame_loading_progress.innerHTML = progress;
	// }

	set_mesh(geometry, material) {
		let mesh = new THREE.Mesh(geometry, material);
		console.log("scene geometry center", this.scene_geometry_center.x, this.scene_geometry_center.y, this.scene_geometry_center.z)
		mesh.position.x -= this.scene_geometry_center.x;
		mesh.position.y -= this.scene_geometry_center.y;
		//var minz = this.scene_geometry.boundingBox.min.z
		//console.log("hahahah", this.scene_geometry.boundingBox.min.z)
		//if (this.resources.datasetname != 'scannet'){
		//	mesh.position.z -= this.scene_geometry_min_z
		//	
		//}
		//mesh.position.z = -this.scene_geometry_center.z;

		return mesh
	}

	add_mesh(container, mesh_list) {
		for (let i = 0; i < mesh_list.length; i++) {
			container.add(mesh_list[i]);
		}
	}

	remove_mesh(container, mesh_list) {
		for (let i = 0; i < mesh_list.length; i++) {
			container.remove(mesh_list[i]);
		}
	}

	parse_pose(pose_object) {
		let parsed = new Object();
		let pose_ids = Object.keys(pose_object);
		for (let i = 0; i < pose_ids.length; i++) {
			let pose_id = parseInt(pose_ids[i]);
			let pose = new THREE.Matrix4();
			pose.fromArray(pose_object[pose_ids[i]]);
			pose.transpose();
			parsed[pose_id] = pose
		}

		return parsed;
	}

	// preload_frame() {
	// 	this.resources.preload_frames = new Object();
	// 	this.resources.num_preload = 0
	// 	let indice_key = Object.keys(this.indices);
	// 	for (let i = 0; i < indice_key.length; i++) {
	// 		this.resources.preload_frames[indice_key[i]] = new Object();
	// 		for (let j = 0; j < this.indices[indice_key[i]].length; j++) {
	// 			let frame = new Image();
	// 			frame.onload = function () {
	// 				this.resources.preload_frames[indice_key[i]][this.indices[indice_key[i]][j]] = frame;
	// 				this.resources.num_preload++;
	// 				this.set_preloading_progress(Math.round(100 * this.resources.num_preload / this.num_frames));
	// 				if (this.resources.num_preload == this.num_frames) {
	// 					this.preload_complete = true;
	// 					document.getElementById("frame_loading_container").style.display = "none";
	// 					console.log("preloading complete")
	// 				}
	// 			}.bind(this);
	// 			// frame.src = path.join("/apps/resource/frame/", this.resources.scene_id, this.indices[i] + ".jpg");
	// 			frame.src = path.join("/apps/resource/frame/reduced", this.resources.scene_id, this.indices[indice_key[i]][j] + ".jpg");
	// 		}
	// 	}
	// }

	insert_center() {
		window.xhr_json("GET", path.join("/apps/database/mesh2cap/query/", this.resources.scene_id, "-1", "-1")).then(results => {
			for (let i = 0; i < results.data.length; i++) {
				let record = results.data[i]
				if (!("center" in record.camera)) {
					record.camera.center = this.scene_geometry_center.toArray();
					window.xhr_post(JSON.stringify(record), "/apps/database/mesh2cap/save").then(() => {
						console.log("inserted scene center");
					});
				}
			}
		});
	}

	get_timestamp() {
		let stamp = new Date();
		let year = "" + stamp.getFullYear();
		let month = "" + (stamp.getMonth() + 1);
		let date = "" + stamp.getDate();
		let hour = "" + stamp.getHours();
		let minute = "" + stamp.getMinutes();
		let second = "" + stamp.getSeconds();

		// format
		if (month.length < 2) month = "0" + month;
		if (date.length < 2) date = "0" + date;
		if (hour.length < 2) hour = "0" + hour;
		if (minute.length < 2) minute = "0" + minute;
		if (second.length < 2) second = "0" + second;

		let date_str = year + '-' + month + '-' + date;
		let time_str = hour + ":" + minute + ":" + second;
		let date_time = date_str + '_' + time_str;

		return date_time;
	}

	set_focus(mode, object_id, anno_id) {
		// reset object hex
		this.init_object_hex();

		// query record
		window.xhr_json("GET", path.join("/apps/database/mesh2cap/query/", this.resources.scene_id, object_id, anno_id)).then(results => {
			try {
				let record = results.data[0];
				let target_id = record.object_id.toString();
				let selected_ids;
				if (mode == "view") {
					// set camera
					let matrixWorld = new THREE.Matrix4();
					matrixWorld.fromArray(record.camera.matrixWorld);
					let new_pos = new THREE.Vector3();
					new_pos.setFromMatrixPosition(matrixWorld);
					let new_lookat = new THREE.Vector3();
					new_lookat.fromArray(record.camera.lookat);
					let new_up = new THREE.Vector3(0, 0, 1);
					this.window_mesh.set_view(new_pos, new_up, new_lookat);

					console.log(new_pos);
					console.log(new_lookat);

					// verification info
					selected_ids = record.verify.selected_in_view.split(" ");
				}
				else {
					// set camera
					this.init_camera();

					// verification info
					selected_ids = record.verify.selected_in_scene.split(" ");
				}

				// set color
				this.object_dict[target_id].material.emissive.setHex(0x218838);

				// if (selected_ids.includes(target_id)) {
				// this.object_dict[target_id].material.emissive.setHex(0x218838);
				// for (let i = 0; i < selected_ids.length; i++) {
				// 	if(selected_ids[i] != target_id) this.object_dict[selected_ids[i]].material.emissive.setHex(0xffc107);
				// }
				// }
				// else {
				// this.object_dict[target_id].material.emissive.setHex(0xff0000);
				// for (let i = 0; i < selected_ids.length; i++) {
				// 	this.object_dict[selected_ids[i]].material.emissive.setHex(0xffc107);
				// }
				// }

			}
			catch (err) {
				console.log("no entry found in the database");
			}
		});
	}

	save_file(strData, filename) {
		let link = document.createElement('a');
		if (typeof link.download === 'string') {
			document.body.appendChild(link); //Firefox requires the link to be in the body
			link.download = filename;
			link.href = strData;
			link.click();
			document.body.removeChild(link); //remove the link when done
		} else {
			location.replace(uri);
		}
	}

	/********************************************
	 *************  Event handlers  *************
	 ********************************************/

	// on_submit_view() {
	// 	let selected_scene = this.select.scene.options[this.select.scene.selectedIndex].value;
	// 	if (selected_scene == "Select a scene") {
	// 		alert("Please select a scene");
	// 	}
	// 	else {
	// 		window.open(path.join("/apps/meshviewer/", "scene_id={0}&sqa_collection={1}".format(selected_scene, this.resources.sqa_db_collection_name)), "_blank");
	// 	}
	// }

	on_click_btn_none() {
		console.log("show the object");
		this.mesh_view = 0;
		this.render_mesh_annotated();
		var pos = new THREE.Vector3();
		this.arrow.getWorldPosition(pos);
		console.log('Arrow pos', pos);
		console.log('Arrow rot', this.arrow.quaternion);
	}

	on_click_btn_surface() {
		console.log("show the mesh surface, current selected instance: " + this.selected_id);
		this.mesh_view = 1;
		this.render_mesh_surface();
		var pos = new THREE.Vector3()
		this.arrow.getWorldPosition(pos);
		console.log('Arrow pos', pos);
		console.log('Arrow rot', this.arrow.quaternion);
	}

	on_click_btn_screenshot() {
		try {
			let strDownloadMime = "image/octet-stream";
			let strMime = "image/jpeg";
			let imgData = this.renderer.domElement.toDataURL(strMime);

			this.save_file(imgData.replace(strMime, strDownloadMime), "screenshot.jpg");

		} catch (e) {
			console.log(e);
			return;
		}
	}

	on_click_btn_info() {
		ReactDOM.render(<InfoContent />, document.getElementById("info_content"), function () {
			this.info.style.display = "block";
			this.info.scrollTop = 0;
		}.bind(this));
	}

	on_click_close_info() {
		this.info.style.display = "none";
	}

	on_click_btn_control() {
		// ReactDOM.render(<ControlContent />, document.getElementById("control_content"), function () {
		// 	this.control.style.display = "block";
		// 	this.control.scrollTop = 0;
		// }.bind(this));
		if (this.task_type) {
			window.open("/apps/tutorial"+this.task_type);
		}
		else {
			window.open("/apps/tutorial");
		}
	}

	on_click_close_control() {
		this.control.style.display = "none";
	}

	on_dismiss_popover(event) {
		// $('[data-toggle="popover"]').each(function () {
		// 	//the 'is' for buttons that trigger popups
		// 	//the 'has' for icons within a button that triggers a popup
		// 	if (!$(this).is(event.target) && $(this).has(event.target).length === 0 && $('.popover').has(event.target).length === 0) {
		// 		(($(this).popover('hide').data('bs.popover')||{}).inState||{}).click = false  // fix for BS 3.3.6
		// 	}
		// });
	}

	on_click_comment(id) {
		return function () {
			// setting
			let operation = id.split("_")[0];
			let object_id = id.split("_")[1];
			let anno_id = id.split("_")[2];
			let misc = id.split("_")[3];
			let comment = misc.split("|")[0];
			let rephrase = misc.split("|")[1];
			$("#{0}_{1}_{2}".format(operation, object_id, anno_id)).popover({
				trigger: 'focus',
				placement: 'top',
				title: comment,
				content: rephrase
			});
			// if (this.visible_popover.shown) {
			// 	if (this.visible_popover.id == "{0}_{1}_{2}".format(operation, object_id, anno_id)) {
			// 		$("#{0}".format(this.visible_popover.id)).popover("hide");

			// 		this.visible_popover = new Object();
			// 	}
			// 	else {
			// 		$("#{0}".format(this.visible_popover.id)).popover("hide");
			// 		$("#{0}_{1}_{2}".format(operation, object_id, anno_id)).popover("show");
			// 		this.visible_popover = new Object();
			// 		this.visible_popover.shown = true;
			// 		this.visible_popover.id = "{0}_{1}_{2}".format(operation, object_id, anno_id)
			// 	}

			// }
			// else {
			// 	$("#{0}_{1}_{2}".format(operation, object_id, anno_id)).popover("show");
			// 	this.visible_popover.shown = true;
			// 	this.visible_popover.id = "{0}_{1}_{2}".format(operation, object_id, anno_id)
			// }

			// set description
			if (this.focused) {
				this.focused.description.style.fontWeight = "normal";
			}
			this.focused = new Object();
			this.focused.description = document.getElementById("description_" + object_id + "_" + anno_id);
			this.focused.description.style.fontWeight = "bold";

			// set view
			// this.set_focus(operation, object_id, anno_id);

		}.bind(this);
	}

	on_click_operation(id) {
		return function () {
			// setting
			let operation = id.split("_")[0];
			let object_id = id.split("_")[1];
			let anno_id = id.split("_")[2];

			// set description
			if (this.focused) {
				this.focused.description.style.fontWeight = "normal";
			}
			this.focused = new Object();
			this.focused.description = document.getElementById("description_" + object_id + "_" + anno_id);
			this.focused.description.style.fontWeight = "bold";

			// set view
			// this.set_focus(operation, object_id, anno_id);
		}.bind(this);
	}

	on_click_label(id) {
		//console.log("calling on click label")
		return function () {
			// remove the old mesh
			this.scene.remove(this.mesh);

			// parse instance id
			if (id == "label_ALL") {
				this.instance_id = -1;
				this.selected_id = "-1"
				this.init_camera();
				this.mesh_view = 1;
				this.render_mesh_surface();
			}
			else {
				this.init_object_hex();
				this.instance_id = id.split("_").slice(-1)[0];
				this.selected_id = id.split("_").slice(-1)[0];
				if (this.intersected) {
					// this.intersected.material.emissive.setHex(this.intersected.currentHex);
					// highlight all objects with the same name instead
					for (let i = 0; i < this.intersected.length; ++i) {
						this.intersected[i].material.emissive.setHex(this.intersected[i].currentHex);
					}
				}
				// this.intersected = this.object_dict[this.instance_id];
				// this.intersected.currentHex = this.intersected.material.emissive.getHex();
				// this.intersected.material.emissive.setHex(0x0059ff);

				// handle nested list
				if (id.split("_")[0] == "labelparent") {
					// unfold the hidden nested labels
					this.hid_all_child_label();
					this.show_child_label_by_parent(id);
				}
				else {
					this.intersected = [this.object_dict[this.instance_id]];
				}
				for (let i = 0; i < this.intersected.length; ++i) {
					this.intersected[i].currentHex = this.intersected[i].material.emissive.getHex();
					this.intersected[i].material.emissive.setHex(0x0059ff);
				}

				// // set focus
				// window.xhr_json("GET", path.join("/apps/database/mesh2cap/query/", this.resources.scene_id, this.selected_id, "-1")).then(results => {
				// 	try {
				// 		let record = results.data[0];
				// 		let target_id = record.object_id.toString();
				// 		let selected_ids;

				// 		// set camera
				// 		let matrixWorld = new THREE.Matrix4();
				// 		matrixWorld.fromArray(record.camera.matrixWorld);
				// 		let new_pos = new THREE.Vector3();
				// 		new_pos.setFromMatrixPosition(matrixWorld);
				// 		let new_lookat = new THREE.Vector3();
				// 		new_lookat.fromArray(record.camera.lookat);
				// 		let new_up = new THREE.Vector3(0, 0, 1);
				// 		this.window_mesh.set_view(new_pos, new_up, new_lookat);

				// 		// verification info
				// 		selected_ids = record.verify.selected_in_view.split(" ");

				// 		// set color
				// 		this.object_dict[target_id].material.emissive.setHex(0x218838);

				// 		// if (selected_ids.includes(target_id)) {
				// 		// 	this.object_dict[target_id].material.emissive.setHex(0x218838);
				// 		// 	for (let i = 0; i < selected_ids.length; i++) {
				// 		// 		if(selected_ids[i] != target_id) this.object_dict[selected_ids[i]].material.emissive.setHex(0xffc107);
				// 		// 	}
				// 		// }
				// 		// else {
				// 		// 	this.object_dict[target_id].material.emissive.setHex(0xff0000);
				// 		// 	for (let i = 0; i < selected_ids.length; i++) {
				// 		// 		this.object_dict[selected_ids[i]].material.emissive.setHex(0xffc107);
				// 		// 	}
				// 		// }
				// 	}
				// 	catch (err) {
				// 		console.log("no entry found in the database");
				// 	}
				// });

			}


			// console.log("select instance id: " + this.selected_id);
			// if (this.datasettype['type'] == 1){
			// 	console.log(typeof this.selected_id)
			// 	this.selected_id = String(Number(this.selected_id) + 1)
			// 	console.log("after change", this.selected_id)
			// }
			// this.all_object_info = this.scenegraph[this.resources.scene_id]['objects_info']//[this.selected_id - 1]
			// for (let obj_id_var = 0; obj_id_var < this.all_object_info.length; obj_id_var++){
				
			// 	//console.log(this.all_object_info[obj_id_var]['id'], this.all_object_info[obj_id_var]['label'])

			// 	if (this.all_object_info[obj_id_var]['id'] == this.selected_id){
			// 		this.selected_object_info = this.all_object_info[obj_id_var];
			// 		break;
			// 	}
			// }
			// this.selected_object_label = this.selected_object_info['label']
			// this.selected_object_size = this.selected_object_info['size']
			// console.log(this.selected_object_size)
			// //const power_factor = 100
			// this.selected_object_width = Math.round(this.selected_object_size[0] * 100)/100
			// this.selected_object_length = Math.round(this.selected_object_size[1] * 100)/100
			// this.selected_object_height = Math.round(this.selected_object_size[2] * 100)/100
			// display_selected_object_info.textContent = "Selecting " + this.selected_object_label + ". " + "The corresponding Width, Length and Height are " + this.selected_object_width + ", " + this.selected_object_length + ", " + this.selected_object_height

					
		}.bind(this);
	}
	/*
	fetch_scenegraph(){
		fetch(path.join("/apps/resource/scenegraph/", this.resources.scene_id, this.resources.scenegraph)).then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok')
			}
			return response.json(); // 将响应解析为 JSON
		})
		.then(data => {
			this.scenegraph = data
			//console.log(this.scenegraph)
			console.log('scenegraph coming !!!!!!!!!!!:')
			console.log(this.scenegraph)
			// 在这里你可以对 data 进行处理，比如将数据传递给其他函数
		})
		.catch(error => {
			console.error('Error loading JSON file:', error)
		})	

	}
	*/

	on_keydown(event) {
		// if (this.window_mesh.is_mouse_in_model_panel() && event.keyCode === 67) {
		// 	event.preventDefault();
		// 	this.mesh_view = (this.mesh_view + 1) % 2;
		// 	if (this.mesh_view) {
		// 		this.render_mesh_surface();
		// 	}
		// 	else {
		// 		this.render_mesh_annotated();
		// 	}
		// }
	}

	on_keyup(event) {
	}


	// on_keydown_keys(event) {
	// 	console.log('key!')
	// 	if (event.keyCode === 83) {
	// 		console.log('key83');
	// 		event.preventDefault();
	// 		this.on_click_btn_screenshot();
	// 	}
	// }

	on_mouseover_label(id) {
		return function () {
			// remove the old mesh
			this.scene.remove(this.mesh);

			// parse instance id
			if (id == "label_ALL") {
				this.instance_id = -1;
				if (this.intersected) {
					// this.intersected.material.emissive.setHex(this.intersected.currentHex);
					// highlight all objects with the same name instead
					for (let i = 0; i < this.intersected.length; ++i) {
						this.intersected[i].material.emissive.setHex(this.intersected[i].currentHex);
					}
				}
			}
			else {
				let ignore_list = [0x218838, 0xff0000, 0xffc107]

				// if (this.intersected && this.instance_id != -1 && !(ignore_list.includes(this.intersected.material.emissive.getHex()))) {
				// 	this.intersected.material.emissive.setHex(this.intersected.currentHex);
				// }
				// this.instance_id = id.split("_").slice(-1)[0];
				// this.intersected = this.object_dict[this.instance_id];
				// this.intersected.currentHex = this.intersected.material.emissive.getHex();
				// this.intersected.material.emissive.setHex(0x0059ff);

				// highlight all objects with the same name instead
				if (this.intersected) {
					for (let i = 0; i < this.intersected.length; ++i) {
						this.intersected[i].material.emissive.setHex(this.intersected[i].currentHex);
					}
				}
				this.instance_id = id.split("_").slice(-1)[0];

				// handle nested list
				if (id.split("_")[0] == "labelparent") {
					// this.hid_all_child_label();
					// this.show_child_label_by_parent(id);
					let ids = this.object_name_to_ids[this.object_dict[this.instance_id].name];
					this.intersected = [];
					for (let i = 0; i < ids.length; ++i) {
						this.intersected.push(this.object_dict[ids[i]]);
					}
				}
				else {
					this.intersected = [this.object_dict[this.instance_id]];
				}
				for (let i = 0; i < this.intersected.length; ++i) {
					this.intersected[i].currentHex = this.intersected[i].material.emissive.getHex();
					this.intersected[i].material.emissive.setHex(0x0059ff);
				}
			}

		}.bind(this);
	}

	on_window_resize(event) {
		this.window_mesh.on_window_resize(event);
		this.renderer.setSize(this.window_mesh.window_width, this.window_mesh.window_height);
	}

	on_window_scroll(event) {
		this.window_mesh.measure();
	}

	mouseclick(event) { }

	mousedown(event) {
		if (event.button === 0){

			//const bbx_cylinder = [this.bounding_box, this.scale_cylinder];

			//this.bbx_cylinder_mouse = {x: 5, y: 5};

			//this.bbx_cylinder_mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			//this.bbx_cylinder_mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

			//this.raycaster.setFromCamera(this.bbx_cylinder_mouse, this.window_mesh.camera);
			
			/*
			const intersects = this.raycaster.intersectObjects(bbx_cylinder, true);

			if (intersects.length > 0) {
				// 找到与鼠标距离最近的物体
				let closestObject = null;
				let minScreenDistance = Infinity;
		
				intersects.forEach(intersect => {
					
					// 将相交点的 3D 坐标转换为 2D 屏幕坐标
					const screenPosition = intersect.point.clone().project(this.window_mesh.camera);
					const screenX = (screenPosition.x + 1) * window.innerWidth / 2;
					const screenY = -(screenPosition.y - 1) * window.innerHeight / 2;
		
					// 计算鼠标与相交点在屏幕上的距离
					const distanceToMouse = Math.sqrt(
						Math.pow(screenX - event.clientX, 2) + Math.pow(screenY - event.clientY, 2)
					);
		
					// 找出距离鼠标最近的物体
					if (distanceToMouse < minScreenDistance) {
						minScreenDistance = distanceToMouse;
						closestObject = intersect.object;
					}
				})
				console.log("closetobject", closestObject)

				if (closestObject === this.bounding_box){
					this.bounding_box_dragControls.enabled = true;
					this.scale_cylinder_dragControls.enabled = false;
				}else if(closestObject === this.scale_cylinder){
					this.bounding_box_dragControls.enabled = false;
					this.scale_cylinder_dragControls.enabled = true;
				}
			
			}else{
				this.bounding_box_dragControls.enabled = false;
				this.scale_cylinder_dragControls.enabled = false;
			}
			*/


			
			const intersectsBoundingBox = this.raycaster.intersectObject(this.bounding_box);
			const intersectsScaleCylinder = this.raycaster.intersectObject(this.scale_cylinder);

			//console.log("bounding box intersect length", intersectsBoundingBox.length)
			//console.log("cylinder intersection length", intersectsScaleCylinder.length)
			
			if (intersectsScaleCylinder.length > 0) {
				//selectedObject = this.scale_cylinder;
				this.bounding_box_dragControls.enabled = false;  // 禁用其他物体的拖拽
				this.scale_cylinder_dragControls.enabled = true;
			}else if (intersectsBoundingBox.length > 0){
				this.bounding_box_dragControls.enabled = true;  // 禁用其他物体的拖拽
				this.scale_cylinder_dragControls.enabled = false;
			}
			
			 

			/*
			if (event.object === this.bounding_box){
			this.bounding_box_dragControls.enabled = true;
			this.scale_cylinder_dragControls.enabled = false;
			}else if (event.object === this.scale_cylinder){
				this.bounding_box_dragControls.enabled = false;
				this.scale_cylinder_dragControls.enabled = true;
			}
			*/
		}
		else{
			this.bounding_box_dragControls.enabled = false;
			this.scale_cylinder_dragControls.enabled = false;
		}

		if (this.arrow_dragging) {
			return
		}
		if (this.window_mesh.is_mouse_in_model_panel()) {
			if (event.button == 0) {
				let intersected = this.raycaster.intersectObjects(this.scene.children.slice(4));
				if (intersected.length > 0) {
					this.selected_id = intersected[0].object.name.split("_")[0];
					this.render_canvas_label(event.clientX, event.clientY);
				}
				else {
					this.selected_id = "-1";
					if (document.getElementById("canvas_label_div")) document.getElementById("id_div_root").removeChild(this.canvas_label);
				}
				// this.render_annotation_results();
			}
			else {
				this.selected_id = "-1";
				if (document.getElementById("canvas_label_div")) document.getElementById("id_div_root").removeChild(this.canvas_label);
			}
			this.window_mesh.mousedown(event);
		}
	}

	mouseup(event) {
		if (this.window_mesh.is_mouse_in_model_panel()) {
			this.window_mesh.mouseup(event);
		}
	}

	mousemove(event) {
		if (this.window_mesh.is_mouse_in_model_panel()) {
			this.window_mesh.mousemove(event);
		}
	}

	mousewheel(event) {
		if (document.getElementById("canvas_label_div")) document.getElementById("id_div_root").removeChild(this.canvas_label);
		this.window_mesh.navigation.mousewheel(event);
	}

	mouseenter(event) {
		this.window_mesh.mouseenter(event);
	}

	mouseleave(event) {
		this.window_mesh.mouseleave(event);
	}

	contextmenu(event) {
		this.window_mesh.navigation.contextmenu(event);
	}

	// arrnow drag events
	onArrowDragClick(event) {
		//console.log("hahahahahahahaha calling on arrow drag click")
		//will be called once you click on the canvas
		//for dragging arrow, will be called only once after dragging arrow,
		 
		event.preventDefault();

		if (this.arrow_dragging === true) {

			const draggableObjects = this.arrow_drag_controls.getObjects();
			draggableObjects.length = 0;

			this.arrowdragmouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			this.arrowdragmouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

			raycaster.setFromCamera(this.arrowdragmouse, this.window_mesh.camera);

			const intersections = raycaster.intersectObjects([arrow], true);

			if (intersections.length > 0) {

				const object = intersections[0].object;

				if (this.arrow.children.includes(object) === true) {

					object.material.emissive.set(0x000000);
					this.scene.attach(object);

				} else {

					object.material.emissive.set(0xaaaaaa);
					this.arrow.attach(object);

				}

				this.arrow_drag_controls.transformGroup = true;
				draggableObjects.push(arrow);

			}


			if (this.arrow.children.length === 0) {

				this.arrow_drag_controls.transformGroup = false;
				draggableObjects.push(arrow);

			}

		}

	}

	attach_listener() {
		// -> event listeners
		this.window_mesh.add_listener('contextmenu', this.contextmenu.bind(this));
		this.window_mesh.add_listener('click', this.mouseclick.bind(this));
		this.window_mesh.add_listener('mousemove', this.mousemove.bind(this));
		this.window_mesh.add_listener('mousedown', this.mousedown.bind(this));
		this.window_mesh.add_listener('mouseup', this.mouseup.bind(this));
		this.window_mesh.add_listener('mousewheel', this.mousewheel.bind(this));
		this.window_mesh.add_listener('mouseenter', this.mouseenter.bind(this));
		this.window_mesh.add_listener('mouseleave', this.mouseleave.bind(this));

		window.addEventListener("resize", this.on_window_resize.bind(this));
		window.addEventListener("scroll", this.on_window_scroll.bind(this));
		// <-

	}

	add_listener(element, event, callback, argument = null) {
		// if (argument){
		// 	console.log("why?")
		// }
		//console.log(element, event, callback, argument)
		// if(argument == '00'){
		// 	console.log("why?")
		// }
		this[callback.name + "_ref"] = callback.bind(this);
		
		if (argument) {
			if (typeof argument == 'string'){
				if (argument.startsWith('ReferExp_')){
					element.addEventListener(event, () => this[callback.name + "_ref"](argument));
				}
				else{
					element.addEventListener(event, this[callback.name + "_ref"](argument));
				}
			}else{
				element.addEventListener(event, this[callback.name + "_ref"](argument));
			}
			//element.addEventListener(event, this[callback.name + "_ref"](argument));
			//console.log(element, event, callback, argument)
		}
		else {
			element.addEventListener(event, this[callback.name + "_ref"]);
			//console.log("end why")
		}
	}

	add_label_listener() {
		this.labels = [];
		// this.on_click_label_ref = this.on_click_label.bind(this)
		// add ALL label
		// let label_ALL_id = "label_ALL";
		// let label_ALL = document.getElementById(label_ALL_id);
		// this.add_listener(label_ALL, "click", this.on_click_label, label_ALL_id);
		// this.add_listener(label_ALL, "mouseover", this.on_mouseover_label, label_ALL_id);
		// this.labels.push(label_ALL);
		// add instance labels
		let labels = document.getElementById("label_container").childNodes;
		for (let label_id = 0; label_id < labels.length; label_id++) {
			let cur_id = labels[label_id].id;
			let cur_label = document.getElementById(cur_id);
			this.add_listener(cur_label, "click", this.on_click_label, cur_id);
			this.add_listener(cur_label, "mouseover", this.on_mouseover_label, cur_id);
			this.labels.push(cur_label);
		}
	}

	create_stats() {
		this.stats = new Stats();
		this.stats.domElement.style.position = "absolute";
		this.stats.domElement.style.left = document.getElementById("canvas_container").style.marginLeft;
		document.getElementById("canvas_container").appendChild(this.stats.dom);
	}

	draw_div() {
		ReactDOM.render(<RootUI />, document.getElementById('id_div_root'));
	}

	hid_all_child_label() {
		Object.entries(this.object_label_dict).forEach(item => {
			//console.log("hidding all child")
			//console.log(this.object_label_dict)
			//console.log(item)
			item[1].forEach(child_id => {
				//console.log(child_id)
				document.getElementById(child_id).setAttribute("hidden", "hidden");
			});
		});
	}

	show_child_label_by_parent(parent_id) {
		this.object_label_dict[parent_id].forEach(child_id => {
			document.getElementById(child_id).removeAttribute("hidden");
		});
	}

}

window.MeshViewer = MeshViewer;
