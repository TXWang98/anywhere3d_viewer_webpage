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
		//console.log("this.raycaster", this.raycaster)
		this.intersected = null;

		// loading bar
		this.loading_bar = document.getElementById("loading_bar");
		this.loading_bar.style.width = "10%";
		

		//console.log('scenegraph coming !!!!!!!!!!!:')
		//console.log(this.scenegraph)

		/*fetch(path.join("/apps/resource/scenegraph/", this.resources.datasetname, this.resources.scene_id, this.resources.scenegraph)).then(response => {
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
		})*/




		/*fetch(path.join("/apps/resource/referring_expressions/", this.resources.datasetname, this.resources.scene_id, this.resources.referring_expressions)).then(response => {
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
		})*/


		// fetch(path.join("/apps/resource/ref_exp_graphs/", this.resources.datasetname, this.resources.scene_id, this.resources.ref_exp_graphs)).then(response => {
		// 	if (!response.ok) {
		// 		throw new Error('Network response was not ok')
		// 	}
		// 	console.log("response", response)
		// 	return response.json(); // 将响应解析为 JSON
		// })
		// .then(data => {
		// 	this.all_referring_expressions = data['referring_expressions']
		// 	this.scenegraph = data['scenegraphs']
		// 	//console.log(this.scenegraph)
		// 	//console.log('scenegraph coming !!!!!!!!!!!:')
		// 	//console.log(this.scenegraph)
		// 	// 在这里你可以对 data 进行处理，比如将数据传递给其他函数
		// })
		// .catch(error => {
		// 	console.error('Error loading referring expressions & scenegraphs placeholder JSON file:', error)
		// })

		const ref_exp_graph_url = `/resource/ref_exp_graphs/${this.resources.datasetname}/${this.resources.scene_id}/${this.resources.ref_exp_graphs}`;

		fetch(ref_exp_graph_url).then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok')
			}
			console.log("response", response)
			return response.json(); // 将响应解析为 JSON
		})
		.then(data => {
			this.all_referring_expressions = data['referring_expressions']
			this.scenegraph = data['scenegraphs']
			//console.log(this.scenegraph)
			//console.log('scenegraph coming !!!!!!!!!!!:')
			//console.log(this.scenegraph)
			// 在这里你可以对 data 进行处理，比如将数据传递给其他函数
		})
		.catch(error => {
			console.error('Error loading referring expressions & scenegraphs placeholder JSON file:', error)
		})




		/*
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
		})
		.catch(error => {
			console.error('Error loading datasettype JSON file:', error)
		})
		*/

		//console.log("hahahahhahahahah", this.resources.sqa_db_collection_name)

		this.resources.sqa_db_collection_name = 'annotation_result'


		// primary promises for loading meshes
		let promises = [
			// window.load_ply_file(path.join("/apps/resource/mesh/", this.resources.datasetname, this.resources.scene_id, this.resources.scene_mesh)),
			// window.load_ply_file("/apps/resource/camera"),
			
			window.load_ply_file("/resource/mesh/" + this.resources.datasetname + "/" +  this.resources.scene_id + "/" + this.resources.scene_mesh),
			window.load_ply_file("/resource/camera")
		];
		
		//console.log("object length", this.resources.scene_object.length)
		for (let i = 0; i < this.resources.scene_object.length; i++) {
			//console.log("object length", this.resources.scene_object.length)
			promises.push(
				// window.load_ply_file(path.join("/apps/resource/object/", this.resources.datasetname, this.resources.scene_id, this.resources.scene_object[i]))
				window.load_ply_file("/resource/object/" + this.resources.datasetname + "/" + this.resources.scene_id + "/" + this.resources.scene_object[i])
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


				this.load_ply_pth_bias()
				this.load_en_zh_obj_name()



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
				const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, opacity: 0.65, transparent: true, linewidth: 20});
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

				//this.bounding_box.name = 'bounding box'
				//this.bounding_box.chinese_name = '三维标注框'
				

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

				/////////////// *************************************************************************************************************************************** ////////////////
				/////////////// 								      For Predicted Bounding Box Visualizations Start                                         			////////////////
				/////////////// *************************************************************************************************************************************** ////////////////


				
				// const pred_bbx_edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.5, 0.5, 0.5));
				// const pred_lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, opacity: 0.65, transparent: true, linewidth:4});
				// this.pred_bounding_box = new THREE.LineSegments(pred_bbx_edges, pred_lineMaterial);

				//console.log("bounding box 坐标范围: ", this.bounding_box)

				
				//console.log("hello", this.bounding_box.position)
				// this.add_mesh(this.scene, [this.pred_bounding_box])
				// this.pred_bounding_box.position.set(0, 0, 0);


				/////////////// *************************************************************************************************************************************** ////////////////
				/////////////// 								      For Predicted Bounding Box Visualizations End                                             			////////////////
				/////////////// *************************************************************************************************************************************** ////////////////


				



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
				this.scale_cylinder_bar_x = 0
				this.scale_cylinder_bar_y = 0
				this.scale_cylinder_bar_z = 0
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
					document.getElementById('scale_cylinder_center_x_position').value = 0;
					document.getElementById('scale_cylinder_center_y_position').value = 0;
					document.getElementById('scale_cylinder_center_z_position').value = 0;
					this.scale_cylinder_bar_x = 0
					this.scale_cylinder_bar_y = 0
					this.scale_cylinder_bar_z = 0
				});
				
				//this.scale_cylinder.name = 'scale_cylinder'
				//this.scale_cylinder.chinese_name = '圆柱体'


				

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
					this.object_mesh[i].chinese_name = this.obj_name_translation[this.object_mesh[i].name];
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
				
				this.setup_prompt_original();
				
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

				//this.lookat_arrow_camera();
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
				this.add_listener(document.getElementById('scale_cylinder_diameter'), "input", this.modify_scale_cylinder_diameter)
				this.add_listener(document.getElementById('scale_cylinder_rotation_angle'),"input", this.rotate_cylinder)
				this.add_listener(document.getElementById('scale_cylinder_center_x_position'), 'input', this.updateCylinderPosition)
				this.add_listener(document.getElementById('scale_cylinder_center_y_position'), 'input', this.updateCylinderPosition)
				this.add_listener(document.getElementById('scale_cylinder_center_z_position'), 'input', this.updateCylinderPosition)
				this.add_listener(document.getElementById('new_referring_expressions'), "focus", this.modify_referring_expressions)
				this.add_listener(document.getElementById('reset_bounding_box_button'), "click", this.reset_bounding_box)
				this.add_listener(document.getElementById('reset_scale_cylinder_button'), "click", this.reset_scale_cylinder)


				// this.add_listener(document.getElementById('pred_bounding_box_x_length'), 'input', this.updatePredCubeSize)
				// this.add_listener(document.getElementById('pred_bounding_box_y_length'), 'input', this.updatePredCubeSize)
				// this.add_listener(document.getElementById('pred_bounding_box_z_length'), 'input', this.updatePredCubeSize)
				// this.add_listener(document.getElementById('pred_bounding_box_center_x_position'), 'input', this.updatePredCubePosition)
				// this.add_listener(document.getElementById('pred_bounding_box_center_y_position'), 'input', this.updatePredCubePosition)
				// this.add_listener(document.getElementById('pred_bounding_box_center_z_position'), 'input', this.updatePredCubePosition)


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
				this.add_listener(document.getElementById('RE09'), "click", this.load_annotation_cache, 'ReferExp_09')
				this.add_listener(document.getElementById('btn_anywhere3D_start_new'), "click", this.start_new_annotation)
				this.add_listener(document.getElementById('btn_anywhere3D_load'), "click", this.load_annotation_db)


				//console.log("Z 坐标范围: ", this.scene_geometry.boundingBox.min.z, "到", this.scene_geometry.boundingBox.max.z)


				//console.log("hello")
				//console.log(this.bounding_box.position)
				//console.log(this.window_mesh.camera.position, this.window_mesh.camera.oritentation)

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
	start_new_annotation(){

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

	}

	load_annotation_db(){

		let request_for_annotation = new Object()
		request_for_annotation.datasetname = this.resources.datasetname
		request_for_annotation.scene_id = this.resources.scene_id
		request_for_annotation.cur_referring_expressions_cnt = this.cur_referring_expressions_cnt
		window.xhr_post(JSON.stringify(request_for_annotation), "/apps/database/sqa3d/load/anywhere3D_collection={0}".format(this.resources.sqa_db_collection_name)).then(results => {
			//console.log(JSON.parse(results))
			this.annotation_db_data = JSON.parse(results)
			//console.log(this.annotation_db_data)
			if (this.annotation_db_data['flag'] == true){
				//console.log("yeahyeahyeah")
				//this.init_camera()

				this.bounding_box_width = this.annotation_db_data['bounding_box_width'];
				this.bounding_box_length = this.annotation_db_data['bounding_box_length'];
				this.bounding_box_height = this.annotation_db_data['bounding_box_height'];

				console.log("size", this.bounding_box_width, this.bounding_box_length, this.bounding_box_height)

				console.log("position", this.annotation_db_data['bounding_box_xpos'], this.annotation_db_data['bounding_box_ypos'], this.annotation_db_data['bounding_box_zpos'])
	
				this.bounding_box.geometry.dispose(); // 释放旧的几何体资源
				this.bounding_box.geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(this.bounding_box_width, this.bounding_box_length, this.bounding_box_height));
				this.bounding_box.position.set(this.annotation_db_data['bounding_box_xpos'], this.annotation_db_data['bounding_box_ypos'], this.annotation_db_data['bounding_box_zpos']);
	
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
	
				document.getElementById('bounding_box_rotation_value').textContent = this.annotation_db_data['bounding_box_rotation_angle'];
				document.getElementById('bounding_box_rotation_angle').value = this.annotation_db_data['bounding_box_rotation_angle'];
	
				this.bounding_box.rotation.z = THREE.Math.degToRad(this.annotation_db_data['bounding_box_rotation_angle']);
				this.bounding_box_rotation_angle = this.annotation_db_data['bounding_box_rotation_angle'];
	
				//set camera with cache
				//console.log(this.window_mesh.camera)
				let camera_pos = this.annotation_db_data['window_camera_position']
				let camera_qua = this.annotation_db_data['window_camera_quaternion']
				let camera_target = this.annotation_db_data['window_camera_target']
				this.window_mesh.camera.position.set(camera_pos.x, camera_pos.y, camera_pos.z)
				this.window_mesh.camera.quaternion.set(camera_qua._x, camera_qua._y, camera_qua._z, camera_qua._w)
				this.window_mesh.navigation.target.set(camera_target.x, camera_target.y, camera_target.z)
				this.window_mesh.navigation.update()
				this.window_mesh.camera.updateMatrix(true)
	
				//set referring expressions with cache
				document.getElementById('original_referring_expressions').textContent = 'Original Referring Expressions: ' + this.all_referring_expressions[this.cur_referring_expressions_cnt]
				document.getElementById('new_referring_expressions').placeholder = this.annotation_db_data['new_referring_expressions']
				document.getElementById('new_referring_expressions').value = ''
	
				//set cylinder with cache
				this.scale_cylinder.geometry.dispose(); 
				this.scale_cylinder.geometry = new THREE.CylinderGeometry(this.annotation_db_data['scale_cylinder_diameter'] / 2, this.annotation_db_data['scale_cylinder_diameter'] / 2, this.annotation_db_data['scale_cylinder_height'], 32);
				this.scale_cylinder.position.set(this.annotation_db_data['scale_cylinder_xpos'], this.annotation_db_data['scale_cylinder_ypos'], this.annotation_db_data['scale_cylinder_zpos']); 
				this.scale_cylinder.rotation.z = THREE.Math.degToRad(this.annotation_db_data['scale_cylinder_rotation_angle']);
	
				document.getElementById('scale_cylinder_diameter_value').textContent = this.annotation_db_data['scale_cylinder_diameter']
				document.getElementById('scale_cylinder_diameter').value = this.annotation_db_data['scale_cylinder_diameter']
				document.getElementById('scale_cylinder_height_value').textContent = this.annotation_db_data['scale_cylinder_height']
				document.getElementById('scale_cylinder_height').value = this.annotation_db_data['scale_cylinder_height']
				document.getElementById('scale_cylinder_rotation_value').textContent = this.annotation_db_data['scale_cylinder_rotation_angle']
				document.getElementById('scale_cylinder_rotation_angle').value = this.annotation_db_data['scale_cylinder_rotation_angle']
				
				document.getElementById('scale_cylinder_center_x_position').value = 0;
				document.getElementById('scale_cylinder_center_y_position').value = 0;
				document.getElementById('scale_cylinder_center_z_position').value = 0;
				this.scale_cylinder_bar_x = 0
				this.scale_cylinder_bar_y = 0
				this.scale_cylinder_bar_z = 0


				if(this.scale_cylinder_exist == 2){
					this.add_mesh(this.scene,[this.scale_cylinder])
					this.scale_cylinder_exist = 1
					document.getElementById('show_hide_cylinder').textContent = 'Hide Cylinder'
				}
	
			}else if (this.annotation_db_data['flag'] == false){
				//console.log("hiiiiiiiiiiiiiiiiiiiiiiii")
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
				
			} 
			//console.log(this.annotation_db_data)
			//console.log(Object.values(JSON.parse(results)))
			
		})

		// if (this.annotation_db_data['flag'] == true){

		// 	this.bounding_box_width = this.annotation_db_data['bounding_box_width'];
		// 	this.bounding_box_length = this.annotation_db_data['bounding_box_length'];
		// 	this.bounding_box_height = this.annotation_db_data['bounding_box_height'];

		// 	this.bounding_box.geometry.dispose(); // 释放旧的几何体资源
		// 	this.bounding_box.geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(this.bounding_box_width, this.bounding_box_length, this.bounding_box_height));
		// 	this.bounding_box.position.set(this.annotation_db_data['bounding_box_xpos'], this.annotation_db_data['bounding_box_ypos'], this.annotation_db_data['bounding_box_zpos']);

		// 	document.getElementById('bounding_box_width_value').textContent = this.bounding_box_width;
		// 	document.getElementById('bounding_box_length_value').textContent = this.bounding_box_length;
		// 	document.getElementById('bounding_box_height_value').textContent = this.bounding_box_height;

		// 	document.getElementById('bounding_box_width').value = this.bounding_box_width;
		// 	document.getElementById('bounding_box_length').value = this.bounding_box_length;
		// 	document.getElementById('bounding_box_height').value = this.bounding_box_height;
			

		// 	document.getElementById('bounding_box_center_x_position').value = 0;
		// 	document.getElementById('bounding_box_center_y_position').value = 0;
		// 	document.getElementById('bounding_box_center_z_position').value = 0;
		// 	this.bounding_box_bar_x = 0
		// 	this.bounding_box_bar_y = 0
		// 	this.bounding_box_bar_z = 0

		// 	document.getElementById('bounding_box_rotation_value').textContent = this.annotation_db_data['bounding_box_rotation_angle'];
		// 	document.getElementById('bounding_box_rotation_angle').value = this.annotation_db_data['bounding_box_rotation_angle'];

		// 	this.bounding_box.rotation.z = THREE.Math.degToRad(this.annotation_db_data['bounding_box_rotation_angle']);
		// 	this.bounding_box_rotation_angle = this.annotation_db_data['bounding_box_rotation_angle'];

		// 	//set camera with cache
		// 	//console.log(this.window_mesh.camera)
		// 	let camera_pos = this.annotation_db_data['window_camera_position']
		// 	let camera_qua = this.annotation_db_data['window_camera_quaternion']
		// 	this.window_mesh.camera.position.set(camera_pos.x, camera_pos.y, camera_pos.z)
		// 	this.window_mesh.camera.quaternion.set(camera_qua._x, camera_qua._y, camera_qua._z, camera_qua._w)

		// 	//set referring expressions with cache
		// 	document.getElementById('original_referring_expressions').textContent = 'Original Referring Expressions: ' + this.all_referring_expressions[this.cur_referring_expressions_cnt]
		// 	document.getElementById('new_referring_expressions').placeholder = this.annotation_db_data['new_referring_expressions']
		// 	document.getElementById('new_referring_expressions').value = ''

		// 	//set cylinder with cache
		// 	this.scale_cylinder.geometry.dispose(); 
		// 	this.scale_cylinder.geometry = new THREE.CylinderGeometry(0.2, 0.2, this.annotation_db_data['scale_cylinder_height'], 32);
		// 	this.scale_cylinder.position.set(this.annotation_db_data['scale_cylinder_xpos'], this.annotation_db_data['scale_cylinder_ypos'], this.annotation_db_data['scale_cylinder_zpos']); 
		// 	this.scale_cylinder.rotation.z = THREE.Math.degToRad(this.annotation_db_data['scale_cylinder_rotation_angle']);

		// 	document.getElementById('scale_cylinder_height_value').textContent = this.annotation_db_data['scale_cylinder_height']
		// 	document.getElementById('scale_cylinder_height').value = this.annotation_db_data['scale_cylinder_height']
		// 	document.getElementById('scale_cylinder_rotation_value').textContent = this.annotation_db_data['scale_cylinder_rotation_angle']
		// 	document.getElementById('scale_cylinder_rotation_angle').value = this.annotation_db_data['scale_cylinder_rotation_angle']

		// 	if(this.scale_cylinder_exist == 2){
		// 		this.add_mesh(this.scene,[this.scale_cylinder])
		// 		this.scale_cylinder_exist = 1
		// 		document.getElementById('show_hide_cylinder').textContent = 'Hide Cylinder'
		// 	}

		// }else if (this.annotation_db_data['flag'] == false){
		// 	//no cache for cur_referring_expressions
		// 	//reset bounding box
		// 	this.reset_bounding_box()
			
		// 	//reset scale_cylinder
		// 	if(this.scale_cylinder_exist == 2){
		// 		this.add_mesh(this.scene,[this.scale_cylinder])
		// 		this.scale_cylinder_exist = 1
		// 		document.getElementById('show_hide_cylinder').textContent = 'Hide Cylinder'
		// 	}
		// 	this.reset_scale_cylinder()

		// 	//reset referring expressions
		// 	document.getElementById('original_referring_expressions').textContent = 'Original Referring Expressions: ' + this.all_referring_expressions[this.cur_referring_expressions_cnt]
		// 	document.getElementById('new_referring_expressions').placeholder = this.all_referring_expressions[this.cur_referring_expressions_cnt]
		// 	document.getElementById('new_referring_expressions').value = ''

		// 	//reset camera
			
		// 	this.init_camera()
			
		// } 

	}

	load_annotation_cache(RE_id){

		//console.log(this.window_mesh.camera)
		//console.log("this.all_referring_expressions", this.all_referring_expressions)
		//console.log("this.cur_referring_expressions_cnt", this.cur_referring_expressions_cnt)
		//console.log("RE" + RE_id.split("_")[1])

		this.selected_buttion_id = RE_id.split("_")[1]
		for(let button_id = 0; button_id <= 9; button_id++){
			if(('0' + String(button_id)) == this.selected_buttion_id){
				document.getElementById("RE" + this.selected_buttion_id).style.backgroundColor = 'red'
				document.getElementById("RE" + this.selected_buttion_id).style.fontWeight = 'bold'
			}else{
				document.getElementById("RE0" + String(button_id)).style.backgroundColor = ''
				document.getElementById("RE0" + String(button_id)).style.fontWeight = 'normal'
			}

		}
		//document.getElementById("RE" + RE_id.split("_")[1]).style.backgroundColor
		//document.getElementById(RE_id).style.backgroundColor = 'red';
		this.cur_referring_expressions_cnt = RE_id.split("_")[1];

		let request_for_annotation = new Object()
		request_for_annotation.datasetname = this.resources.datasetname
		request_for_annotation.scene_id = this.resources.scene_id
		request_for_annotation.cur_referring_expressions_cnt = this.cur_referring_expressions_cnt
		window.xhr_post(JSON.stringify(request_for_annotation), "/apps/database/sqa3d/load/anywhere3D_collection={0}".format(this.resources.sqa_db_collection_name)).then(results => {
			this.querying_annotation_db_data = JSON.parse(results)
			if (this.querying_annotation_db_data['flag'] == true){
				document.getElementById('original_referring_expressions').textContent = "There is already an annotation for this referring expressions ID in database. Click 'Start New Current ID Annotations' to start a new one. Click 'Load Current ID Annotations' to load ones in database."
				document.getElementById('new_referring_expressions').placeholder = ''
				document.getElementById('new_referring_expressions').value = ''
			}else if(this.querying_annotation_db_data['flag'] == false){
				document.getElementById('original_referring_expressions').textContent = "Current referring expressions ID has not been annotated yet, click 'Start New Current ID Annotations' to start annotating."
				document.getElementById('new_referring_expressions').placeholder = ''
				document.getElementById('new_referring_expressions').value = ''
			}
		
		})
			//console.log(JSON.parse(results))

		// document.getElementById('original_referring_expressions').textContent = 
		// document.getElementById('new_referring_expressions').placeholder = 'Please consider loading current ID annotations first!'
		// document.getElementById('new_referring_expressions').value = ''
		
		


		//let annotation_cache_div = document.getElementById('annotation_cache_div');
		//let annotation_cache_data = annotation_cache_div.textContent.trim() ? JSON.parse(annotation_cache_div.textContent) : {};

		
		// if(this.cur_referring_expressions_cnt in annotation_cache_data){
		// 	console.log("cur cache data", annotation_cache_data[this.cur_referring_expressions_cnt])
		// 	let cur_cache_data = annotation_cache_data[this.cur_referring_expressions_cnt]

		// 	//set bounding box with cache
		// 	this.bounding_box_width = cur_cache_data['bounding_box_width'];
		// 	this.bounding_box_length = cur_cache_data['bounding_box_length'];
		// 	this.bounding_box_height = cur_cache_data['bounding_box_height'];

		// 	this.bounding_box.geometry.dispose(); // 释放旧的几何体资源
		// 	this.bounding_box.geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(this.bounding_box_width, this.bounding_box_length, this.bounding_box_height));
		// 	this.bounding_box.position.set(cur_cache_data['bounding_box_xpos'], cur_cache_data['bounding_box_ypos'], cur_cache_data['bounding_box_zpos']);

		// 	document.getElementById('bounding_box_width_value').textContent = this.bounding_box_width;
		// 	document.getElementById('bounding_box_length_value').textContent = this.bounding_box_length;
		// 	document.getElementById('bounding_box_height_value').textContent = this.bounding_box_height;

		// 	document.getElementById('bounding_box_width').value = this.bounding_box_width;
		// 	document.getElementById('bounding_box_length').value = this.bounding_box_length;
		// 	document.getElementById('bounding_box_height').value = this.bounding_box_height;
			

		// 	document.getElementById('bounding_box_center_x_position').value = 0;
		// 	document.getElementById('bounding_box_center_y_position').value = 0;
		// 	document.getElementById('bounding_box_center_z_position').value = 0;
		// 	this.bounding_box_bar_x = 0
		// 	this.bounding_box_bar_y = 0
		// 	this.bounding_box_bar_z = 0

		// 	document.getElementById('bounding_box_rotation_value').textContent = cur_cache_data['bounding_box_rotation_angle'];
		// 	document.getElementById('bounding_box_rotation_angle').value = cur_cache_data['bounding_box_rotation_angle'];

		// 	this.bounding_box.rotation.z = THREE.Math.degToRad(cur_cache_data['bounding_box_rotation_angle']);
		// 	this.bounding_box_rotation_angle = cur_cache_data['bounding_box_rotation_angle'];

		// 	//set camera with cache
		// 	//console.log(this.window_mesh.camera)
		// 	let camera_pos = cur_cache_data['window_camera_position']
		// 	let camera_qua = cur_cache_data['window_camera_quaternion']
		//  let camera_target = cur_cache_data['window_camera_target']
		// 	this.window_mesh.camera.position.set(camera_pos.x, camera_pos.y, camera_pos.z)
		// 	this.window_mesh.camera.quaternion.set(camera_qua._x, camera_qua._y, camera_qua._z, camera_qua._w)
		//  this.window_mesh.navigation.target.set(camera_target.x, camera_target.y, camera_target.z)
		//  this.window_mesh.navigation.update()
		//  this.window_mesh.camera.updataeMatrixWorld(true)

		// 	//set referring expressions with cache
		// 	document.getElementById('original_referring_expressions').textContent = 'Original Referring Expressions: ' + this.all_referring_expressions[this.cur_referring_expressions_cnt]
		// 	document.getElementById('new_referring_expressions').placeholder = cur_cache_data['new_referring_expressions']
		// 	document.getElementById('new_referring_expressions').value = ''

		// 	//set cylinder with cache
		// 	this.scale_cylinder.geometry.dispose(); 
		// 	this.scale_cylinder.geometry = new THREE.CylinderGeometry(0.2, 0.2, cur_cache_data['scale_cylinder_height'], 32);
		// 	this.scale_cylinder.position.set(cur_cache_data['scale_cylinder_xpos'], cur_cache_data['scale_cylinder_ypos'], cur_cache_data['scale_cylinder_zpos']); 
		// 	this.scale_cylinder.rotation.z = THREE.Math.degToRad(cur_cache_data['scale_cylinder_rotation_angle']);

		// 	document.getElementById('scale_cylinder_height_value').textContent = cur_cache_data['scale_cylinder_height']
		// 	document.getElementById('scale_cylinder_height').value = cur_cache_data['scale_cylinder_height']
		// 	document.getElementById('scale_cylinder_rotation_value').textContent = cur_cache_data['scale_cylinder_rotation_angle']
		// 	document.getElementById('scale_cylinder_rotation_angle').value = cur_cache_data['scale_cylinder_rotation_angle']

		// 	if(this.scale_cylinder_exist == 2){
		// 		this.add_mesh(this.scene,[this.scale_cylinder])
		// 		this.scale_cylinder_exist = 1
		// 		document.getElementById('show_hide_cylinder').textContent = 'Hide Cylinder'
		// 	}


		// }else{
		// 	//no cache for cur_referring_expressions
		// 	//reset bounding box
		// 	this.reset_bounding_box()
			
		// 	//reset scale_cylinder
		// 	if(this.scale_cylinder_exist == 2){
		// 		this.add_mesh(this.scene,[this.scale_cylinder])
		// 		this.scale_cylinder_exist = 1
		// 		document.getElementById('show_hide_cylinder').textContent = 'Hide Cylinder'
		// 	}
		// 	this.reset_scale_cylinder()

		// 	//reset referring expressions
		// 	document.getElementById('original_referring_expressions').textContent = 'Original Referring Expressions: ' + this.all_referring_expressions[this.cur_referring_expressions_cnt]
		// 	document.getElementById('new_referring_expressions').placeholder = this.all_referring_expressions[this.cur_referring_expressions_cnt]
		// 	document.getElementById('new_referring_expressions').value = ''

		// 	//reset camera
			
		// 	this.init_camera()
			
		// }
		
		

	}

	callAxes(){
		//console.log("calling axes out of nowhere")
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


		let original_cylinder_radius = this.scale_cylinder.geometry.parameters.radiusBottom
		const new_cylinder_height = parseFloat(document.getElementById('scale_cylinder_height').value) || 0.01;
		document.getElementById('scale_cylinder_height_value').textContent = new_cylinder_height;
		this.scale_cylinder.geometry.dispose(); 
		this.scale_cylinder.geometry = new THREE.CylinderGeometry(original_cylinder_radius, original_cylinder_radius, new_cylinder_height, 32);
	}

	modify_scale_cylinder_diameter(){
		console.log('calling scale cylinder',this.scale_cylinder_exist)
		if (this.scale_cylinder_exist == 2) return;

		let original_cylinder_height = this.scale_cylinder.geometry.parameters.height
		const new_cylinder_diameter = parseFloat(document.getElementById('scale_cylinder_diameter').value) || 0.01;
		document.getElementById('scale_cylinder_diameter_value').textContent = new_cylinder_diameter;
		this.scale_cylinder.geometry.dispose(); 
		this.scale_cylinder.geometry = new THREE.CylinderGeometry(new_cylinder_diameter/2, new_cylinder_diameter/2, original_cylinder_height, 32);

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
			document.getElementById('scale_cylinder_diameter_value').textContent = 0.4;
			document.getElementById('scale_cylinder_diameter').value = 0.4
			document.getElementById('scale_cylinder_height_value').textContent = 0.5;
			document.getElementById('scale_cylinder_height').value = 0.5
			document.getElementById('scale_cylinder_rotation_value').textContent = 0
			document.getElementById('scale_cylinder_rotation_angle').value = 0

			document.getElementById('scale_cylinder_center_x_position').value = 0;
			document.getElementById('scale_cylinder_center_y_position').value = 0;
			document.getElementById('scale_cylinder_center_z_position').value = 0;
			this.scale_cylinder_bar_x = 0;
			this.scale_cylinder_bar_y = 0;
			this.scale_cylinder_bar_z = 0;

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

	updatePredCubeSize() {
		
		
		const pred_new_width = parseFloat(document.getElementById('pred_bounding_box_x_length').value) || 0.01;
		const pred_new_length = parseFloat(document.getElementById('pred_bounding_box_y_length').value) || 0.01; // 深度
		const pred_new_height = parseFloat(document.getElementById('pred_bounding_box_z_length').value) || 0.01; // 高度
		// document.getElementById('pred_bounding_box_width_value').textContent = new_width;
		// document.getElementById('pred_bounding_box_length_value').textContent = new_length;
		// document.getElementById('bounding_box_height_value').textContent = new_height;

		// this.pred_bounding_box_width = new_width;
		// this.pred_bounding_box_length = new_length;
		// this.pred_bounding_box_height = new_height;

		const pred_bounding_box_current_position = this.pred_bounding_box.position.clone(); 

		this.pred_bounding_box.geometry.dispose(); // 释放旧的几何体资源
		this.pred_bounding_box.geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(pred_new_width, pred_new_length, pred_new_height));
		this.pred_bounding_box.position.copy(pred_bounding_box_current_position); 


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



	updatePredCubePosition(){

		if (this.resources.datasetname == "scannet"){
			this.pred_bounding_box.position.x = parseFloat(document.getElementById('pred_bounding_box_center_x_position').value) || 0.01;
			this.pred_bounding_box.position.y = parseFloat(document.getElementById('pred_bounding_box_center_y_position').value) || 0.01;
			this.pred_bounding_box.position.z = parseFloat(document.getElementById('pred_bounding_box_center_z_position').value) || 0.01;

		}
		else{
			this.pred_bounding_box.position.x = this.ply_pth_bias[this.resources.datasetname][this.resources.scene_id]["bias_x"] + parseFloat(document.getElementById('pred_bounding_box_center_x_position').value) || 0.01;
			this.pred_bounding_box.position.y = this.ply_pth_bias[this.resources.datasetname][this.resources.scene_id]["bias_y"] + parseFloat(document.getElementById('pred_bounding_box_center_y_position').value) || 0.01;
			this.pred_bounding_box.position.z = this.ply_pth_bias[this.resources.datasetname][this.resources.scene_id]["bias_z"] + parseFloat(document.getElementById('pred_bounding_box_center_z_position').value) || 0.01;
		}

		
	}

	updateCylinderPosition(){
		//using x, y, z as absolute position of scale cylinder

		//using delta x, delta y, delta z as relative position
		const scale_cylinder_current_position = this.scale_cylinder.position.clone();

		const scale_cylinder_new_bar_x = parseFloat(document.getElementById('scale_cylinder_center_x_position').value) 
    	const scale_cylinder_new_bar_y = parseFloat(document.getElementById('scale_cylinder_center_y_position').value) 
    	const scale_cylinder_new_bar_z = parseFloat(document.getElementById('scale_cylinder_center_z_position').value)

		const scale_cylinder_delta_bar_x = scale_cylinder_new_bar_x - this.scale_cylinder_bar_x
		const scale_cylinder_delta_bar_y = scale_cylinder_new_bar_y - this.scale_cylinder_bar_y
		const scale_cylinder_delta_bar_z = scale_cylinder_new_bar_z - this.scale_cylinder_bar_z


		this.scale_cylinder.position.x = scale_cylinder_current_position.x + scale_cylinder_delta_bar_x;
		this.scale_cylinder.position.y = scale_cylinder_current_position.y + scale_cylinder_delta_bar_y;
		this.scale_cylinder.position.z = scale_cylinder_current_position.z + scale_cylinder_delta_bar_z;

		this.scale_cylinder_bar_x = scale_cylinder_new_bar_x
		this.scale_cylinder_bar_y = scale_cylinder_new_bar_y
		this.scale_cylinder_bar_z = scale_cylinder_new_bar_z
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
					<p><span style="font-size: 1.2em;">3D Bounding Box</span></p>
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
					<label for="bounding_box_rotation_angle" style="width: 30%;">rot: <span id="bounding_box_rotation_value">0</span></label>
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
					<p><span style="font-size: 1.2em;">Scale Cylinder</span></p>
					<button id="reset_scale_cylinder_button" style="width: 120px; height: 35px; font-size: 14px;" >Reset</button>
					<button id="call_cylinder_button" style="width: 120px; height: 35px; font-size: 14px;" ><span id="show_hide_cylinder">Hide Cylinder</span></button>
				</div>
				<div style="display: flex; align-items: center; width: 100%;">
					<label for="scale_cylinder_diameter" style="width: 30%;">D: <span id="scale_cylinder_diameter_value">0.4</span></label>
					<input type="range" id="scale_cylinder_diameter" min="0" max="5" step = "0.01" value="0.4" style="flex-grow: 1;">
				</div>
				<div style="display: flex; align-items: center; width: 100%;">
					<label for="scale_cylinder_height" style="width: 30%;">L: <span id="scale_cylinder_height_value">0.5</span></label>
					<input type="range" id="scale_cylinder_height" min="0" max="10" step = "0.01" value="0.5" style="flex-grow: 1;">		
				</div>
				<div style="display: flex; align-items: center; width: 100%;">
					<label for="scale_cylinder_rotation_angle" style="width: 30%;">rot: <span id="scale_cylinder_rotation_value">0</span></label>
					<input type="range" id="scale_cylinder_rotation_angle" min="0" max="360" step = "1" value="0" style="flex-grow: 1;">
				</div>
				<div style="display: flex; align-items: center; width: 100%;">
					<label for="scale_cylinder_center_x_position" style="color: #ff0000; width: 30%;">X: </label>
					<input type="range" id="scale_cylinder_center_x_position" min="-5" max="5" step="0.01" value="0" style="flex-grow: 1;">
				</div>
				<div style="display: flex; align-items: center; width: 100%;">
					<label for="scale_cylinder_center_y_position" style="color: #228B22; width: 30%;">Y: </label>
					<input type="range" id="scale_cylinder_center_y_position" min="-5" max="5" step="0.01" value="0" style="flex-grow: 1;">
				</div>
				<div style="display: flex; align-items: center; width: 100%;">
					<label for="scale_cylinder_center_z_position" style="color: #0000ff; width: 30%;">Z: </label>
					<input type="range" id="scale_cylinder_center_z_position" min="-5" max="5" step="0.01" value="0" style="flex-grow: 1;">
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
			
			<button id="RE00" style="width: 7%;">00</button>
			<button id="RE01" style="width: 7%;">01</button>
			<button id="RE02" style="width: 7%;">02</button>
			<button id="RE03" style="width: 7%;">03</button>
			<button id="RE04" style="width: 7%;">04</button>
			<button id="RE05" style="width: 7%;">05</button>
			<button id="RE06" style="width: 7%;">06</button>
			<button id="RE07" style="width: 7%;">07</button>
			<button id="RE08" style="width: 7%;">08</button>
			<button id="RE09" style="width: 7%;">09</button>
			
			</b>
			<div>
				<span id='original_referring_expressions'></span></br>
				<input type="text" class="form-control" id="new_referring_expressions" placeholder='' value=''>
			</div>
			</b>

			<!--div>
				<label for="pred_bounding_box_center_x_position">pred_center_x: </label>
				<input type="number" id="pred_bounding_box_center_x_position" step="0.01">
				<label for="pred_bounding_box_center_y_position">pred_center_y: </label>
				<input type="number" id="pred_bounding_box_center_y_position" step="0.01">
				<label for="pred_bounding_box_center_z_position">pred_center_z: </label>
				<input type="number" id="pred_bounding_box_center_z_position" step="0.01">
				<label for="pred_bounding_box_length_x">pred_length_x:</span>
				<input type="number" id="pred_bounding_box_x_length" step="0.01">
				<label for="pred_bounding_box_length_y">pred_length_y:</span>
				<input type="number" id="pred_bounding_box_y_length" step="0.01">
				<label for="pred_bounding_box_length_z">pred_length_z:</span>
				<input type="number" id="pred_bounding_box_z_length" step="0.01">
			</div-->
		</p>
		<h1><hr/></h1>
		<div style="display: flex; width: 100%;">
			<button id="btn_anywhere3D_start_new" class="btn btn-primary btn-lg" style="width: 30%; margin-left: 2.5%">Start New Current ID Annotations</button>
			<button id="btn_anywhere3D_load" class="btn btn-primary btn-lg" style="width: 30%; margin-left: 2.5%">Load Current ID Annotations</button>
			<button id="btn_anywhere3D_submit" class="btn btn-primary btn-lg" type="submit" style="width: 30%; margin-left: 2.5%">Save Current ID Annotations</button>
		</div>
		`;

		//this.btn.anywhere3D_submit = document.getElementById("btn_anywhere3D_submit");
		//this.add_listener(this.btn.anywhere3D_submit, "click", this.on_click_btn_anywhere3D_submit_original);
	}
	on_click_btn_anywhere3D_submit_original() {
		
		var record = {};

		let record_for_db = new Object()

		//save scene information
		record['datasetname'] = this.resources.datasetname;
		record['scene_id'] = this.resources.scene_id;
		record['cur_referring_expressions_cnt'] = this.cur_referring_expressions_cnt

		record_for_db.datasetname = this.resources.datasetname;
		record_for_db.scene_id = this.resources.scene_id
		record_for_db.cur_referring_expressions_cnt = this.cur_referring_expressions_cnt

		//save referring_expressions
		var input_referring_expressions_field = document.getElementById("new_referring_expressions");
		if (input_referring_expressions_field.value === ''){
			record['new_referring_expressions'] = input_referring_expressions_field.placeholder
			record_for_db.new_referring_expressions = input_referring_expressions_field.placeholder
		}else{
			record['new_referring_expressions'] = input_referring_expressions_field.value
			record_for_db.new_referring_expressions = input_referring_expressions_field.value
		}
		record['original_referring_expressions'] = this.all_referring_expressions[this.cur_referring_expressions_cnt]
		record_for_db.original_referring_expressions = this.all_referring_expressions[this.cur_referring_expressions_cnt]

		
		//save bounding box information
		/*
		console.log("BoundingBoxWidth", this.bounding_box_width)
		console.log("BoundingBoxLength", this.bounding_box_length)
		console.log("BoundingBoxHeight", this.bounding_box_height)
		*/

		record['bounding_box_width'] = this.bounding_box_width
		record['bounding_box_length'] = this.bounding_box_length
		record['bounding_box_height'] = this.bounding_box_height

		record_for_db.bounding_box_width = this.bounding_box_width
		record_for_db.bounding_box_length = this.bounding_box_length
		record_for_db.bounding_box_height = this.bounding_box_height

		/*
		console.log(this.bounding_box.position)
		console.log(this.bounding_box.position['x'])
		console.log(this.bounding_box.position['y'])
		console.log(this.bounding_box.position['z'])
		*/

		record['bounding_box_xpos'] = this.bounding_box.position.x
		record['bounding_box_ypos'] = this.bounding_box.position.y
		record['bounding_box_zpos'] = this.bounding_box.position.z

		record_for_db.bounding_box_xpos = this.bounding_box.position.x
		record_for_db.bounding_box_ypos = this.bounding_box.position.y
		record_for_db.bounding_box_zpos = this.bounding_box.position.z

		//console.log("bounding box rotation angle",this.bounding_box_rotation_angle)


		let BoundingBox_Rotation_Angle = THREE.Math.radToDeg(this.bounding_box.rotation.z)
		BoundingBox_Rotation_Angle = Math.round((BoundingBox_Rotation_Angle % 360 + 360) % 360)
		record['bounding_box_rotation_angle'] = this.bounding_box_rotation_angle //Math.round((BoundingBox_Rotation_Angle % 360 + 360) % 360)
		record_for_db.bounding_box_rotation_angle = this.bounding_box_rotation_angle
		//assert(record['bounding_box_rotation_angle'] == this.bounding_box_rotation_angle)




		//save cylinder information
		

		// 将角度限制在 0 到 360 范围内
		record['scale_cylinder_xpos'] = this.scale_cylinder.position.x
		record['scale_cylinder_ypos'] = this.scale_cylinder.position.y
		record['scale_cylinder_zpos'] = this.scale_cylinder.position.z
		record['scale_cylinder_height'] = this.scale_cylinder.geometry.parameters.height
		record['scale_cylinder_diameter'] = parseFloat(document.getElementById('scale_cylinder_diameter').value) || 0.01

		let cylinderRotationAngle = THREE.Math.radToDeg(this.scale_cylinder.rotation.z)
		record['scale_cylinder_rotation_angle'] = Math.round((cylinderRotationAngle % 360 + 360) % 360)

		record_for_db.scale_cylinder_xpos = this.scale_cylinder.position.x
		record_for_db.scale_cylinder_ypos = this.scale_cylinder.position.y
		record_for_db.scale_cylinder_zpos = this.scale_cylinder.position.z
		record_for_db.scale_cylinder_height = this.scale_cylinder.geometry.parameters.height
		record_for_db.scale_cylinder_diameter = parseFloat(document.getElementById('scale_cylinder_diameter').value) || 0.01
		record_for_db.scale_cylinder_rotation_angle = Math.round((cylinderRotationAngle % 360 + 360) % 360)



		//save camera information
		record['window_camera_position'] = this.window_mesh.camera.position
		record['window_camera_quaternion'] = this.window_mesh.camera.quaternion
		record['window_camera_target'] = this.window_mesh.navigation.target

		record_for_db.window_camera_position = this.window_mesh.camera.position
		record_for_db.window_camera_quaternion = this.window_mesh.camera.quaternion
		record_for_db.window_camera_target = this.window_mesh.navigation.target
		//console.log(record)

		
		const annotation_cache_div = document.getElementById('annotation_cache_div') 
		const annotation_cache_data = annotation_cache_div.textContent.trim() ? JSON.parse(annotation_cache_div.textContent) : {};
		//const annotation_cache_data = JSON.parse(annotation_cache_div.textContent)
		annotation_cache_data[this.cur_referring_expressions_cnt] = record
		annotation_cache_div.textContent = JSON.stringify(annotation_cache_data)


		console.log("Recorded anywhere3d annotation!");
		alert(["Recorded.", record.datasetname, record.scene_id, record.cur_referring_expressions_cnt,". However, This is a preview annotation interface. Save functionality is disabled, and no data will be saved!"].join(' '));
		

		
		// console.log("this.resources.sqa_db_collection_name", this.resources.sqa_db_collection_name)
		// window.xhr_post(JSON.stringify(record_for_db), "/apps/database/sqa3d/save/anywhere3D_collection={0}".format(this.resources.sqa_db_collection_name)).then(() => {
		// 	console.log("inserted sqa!");
		// 	alert(["Recorded.", record.datasetname, record.scene_id, record.cur_referring_expressions_cnt].join(' '));
		// });
		


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

	load_ply_pth_bias(){
		this.ply_pth_bias = {
			"multiscan":{
				"scene0112_00": {
					"bias_x": 0.03,
					"bias_y": -0.33,
					"bias_z": -1.49
				},
				"scene0109_00": {
					"bias_x": -0.33,
					"bias_y": 0.64,
					"bias_z": -1.18
				},
				"scene0107_00": {
					"bias_x": 0.29,
					"bias_y": 0.39,
					"bias_z": -1.37
				},
				"scene0108_00": {
					"bias_x": -0.2,
					"bias_y": -0.52,
					"bias_z": -1.39
				},
				"scene0111_00": {
					"bias_x": -0.45,
					"bias_y": -0.05,
					"bias_z": -1.3
				},
				"scene0106_00": {
					"bias_x": 0.16,
					"bias_y": 0.31,
					"bias_z": -1.3
				}
			},
			"3RScan":{
				"scene0002_00": {
					"bias_x": -0.03,
					"bias_y": -0.02,
					"bias_z": -2.96
				},
				"scene0068_00": {
					"bias_x": 0.13,
					"bias_y": 2.05,
					"bias_z": -1.46
				},
				"scene0073_00": {
					"bias_x": 2.25,
					"bias_y": -1.74,
					"bias_z": -1.63
				},
				"scene0087_00": {
					"bias_x": -0.06,
					"bias_y": 1.14,
					"bias_z": -1.5
				},
				"scene0095_00": {
					"bias_x": 2.25,
					"bias_y": 0.67,
					"bias_z": -3.13
				},
				"scene0171_00": {
					"bias_x": 0.36,
					"bias_y": -1.46,
					"bias_z": -1.93
				},
				"scene0192_00": {
					"bias_x": -2.15,
					"bias_y": 0.92,
					"bias_z": -1.58
				},
				"scene0219_00": {
					"bias_x": 0.24,
					"bias_y": 0.91,
					"bias_z": -1.95
				},
				"scene0275_00": {
					"bias_x": -0.27,
					"bias_y": 0.56,
					"bias_z": -3.44
				},
				"scene0300_00": {
					"bias_x": 1.08,
					"bias_y": 0.56,
					"bias_z": -1.48
				},
				"scene0366_00": {
					"bias_x": -1.02,
					"bias_y": 0.97,
					"bias_z": -1.91
				},
				"scene0417_00": {
					"bias_x": -0.52,
					"bias_y": 0.13,
					"bias_z": -1.69
				},
				"scene0446_00": {
					"bias_x": -0.71,
					"bias_y": 0.8,
					"bias_z": -1.58
				},
				"scene0519_00": {
					"bias_x": -0.32,
					"bias_y": -0.73,
					"bias_z": -1.76
				},
				"scene0555_00": {
					"bias_x": -0.47,
					"bias_y": 1.84,
					"bias_z": -3.52
				},
				"scene0588_00": {
					"bias_x": 0.03,
					"bias_y": 1.37,
					"bias_z": -1.53
				},
				"scene0614_00": {
					"bias_x": -3.74,
					"bias_y": -0.48,
					"bias_z": -1.73
				},
				"scene0630_00": {
					"bias_x": 0.7,
					"bias_y": -0.18,
					"bias_z": -1.63
				},
				"scene0635_00": {
					"bias_x": -1.68,
					"bias_y": 0.62,
					"bias_z": -2.97
				},
				"scene0741_00": {
					"bias_x": 0.2,
					"bias_y": 0.21,
					"bias_z": -1.73
				},
				"scene0865_00": {
					"bias_x": -0.79,
					"bias_y": 1.78,
					"bias_z": -2.79
				},
				"scene0986_00": {
					"bias_x": 1.42,
					"bias_y": -0.5,
					"bias_z": -1.62
				},
				"scene0989_00": {
					"bias_x": 0.09,
					"bias_y": -0.1,
					"bias_z": -1.5
				},
				"scene0992_00": {
					"bias_x": -0.33,
					"bias_y": 0.15,
					"bias_z": -3.14
				},
				"scene1016_00": {
					"bias_x": 0.1,
					"bias_y": -0.81,
					"bias_z": -1.61
				},
				"scene1017_00": {
					"bias_x": -1.7,
					"bias_y": -0.05,
					"bias_z": -1.54
				},
				"scene1024_00": {
					"bias_x": -1.31,
					"bias_y": 0.36,
					"bias_z": -2.05
				},
				"scene1033_00": {
					"bias_x": -3.07,
					"bias_y": -1.76,
					"bias_z": -1.74
				},
				"scene1057_00": {
					"bias_x": 0.82,
					"bias_y": 0.35,
					"bias_z": -2.61
				},
				"scene1117_00": {
					"bias_x": -2.21,
					"bias_y": 0.42,
					"bias_z": -2.62
				},
				"scene1119_00": {
					"bias_x": -0.51,
					"bias_y": -2.74,
					"bias_z": -3.61
				},
				"scene1175_00": {
					"bias_x": -1.75,
					"bias_y": -1.14,
					"bias_z": -1.41
				},
				"scene1181_00": {
					"bias_x": 0.68,
					"bias_y": 3.16,
					"bias_z": -1.83
				},
				"scene1232_00": {
					"bias_x": 1.09,
					"bias_y": -0.21,
					"bias_z": -1.85
				},
				"scene1235_00": {
					"bias_x": 0.78,
					"bias_y": -0.88,
					"bias_z": -1.43
				},
				"scene1312_00": {
					"bias_x": -0.42,
					"bias_y": -0.33,
					"bias_z": -1.61
				},
				"scene1335_00": {
					"bias_x": -0.81,
					"bias_y": 1.36,
					"bias_z": -1.6
				}
			},
			"arkitscene_valid":{
				"scene0004_00": {
					"bias_x": 1.9,
					"bias_y": 0.75,
					"bias_z": -1.75
				},
				"scene0005_00": {
					"bias_x": 1.94,
					"bias_y": -0.38,
					"bias_z": -2.19
				},
				"scene0008_00": {
					"bias_x": -3.17,
					"bias_y": -0.8,
					"bias_z": -1.97
				},
				"scene0009_00": {
					"bias_x": -0.34,
					"bias_y": -0.06,
					"bias_z": -1.41
				},
				"scene0012_00": {
					"bias_x": -0.2,
					"bias_y": 0.02,
					"bias_z": -0.76
				},
				"scene0018_00": {
					"bias_x": -3.55,
					"bias_y": 1.31,
					"bias_z": -1.19
				},
				"scene0020_00": {
					"bias_x": -0.37,
					"bias_y": 1.56,
					"bias_z": -2.09
				},
				"scene0025_00": {
					"bias_x": 0.77,
					"bias_y": 3.01,
					"bias_z": -0.58
				},
				"scene0030_00": {
					"bias_x": -1.02,
					"bias_y": 0.6,
					"bias_z": -1.16
				},
				"scene0040_00": {
					"bias_x": 2.48,
					"bias_y": -1.2,
					"bias_z": -3.43
				},
				"scene0041_00": {
					"bias_x": 2.71,
					"bias_y": 2.51,
					"bias_z": -1.85
				},
				"scene0047_00": {
					"bias_x": 1.82,
					"bias_y": 2.75,
					"bias_z": -0.8
				},
				"scene0051_00": {
					"bias_x": 2.52,
					"bias_y": 2.03,
					"bias_z": -0.68
				},
				"scene0053_00": {
					"bias_x": -0.28,
					"bias_y": 0.86,
					"bias_z": -0.56
				},
				"scene0057_00": {
					"bias_x": -1.36,
					"bias_y": 0.92,
					"bias_z": -0.52
				},
				"scene0064_00": {
					"bias_x": 1.48,
					"bias_y": 4.74,
					"bias_z": -1.35
				},
				"scene0066_00": {
					"bias_x": 0.42,
					"bias_y": -1.29,
					"bias_z": -1.37
				},
				"scene0067_00": {
					"bias_x": -0.78,
					"bias_y": 2.45,
					"bias_z": -1.15
				},
				"scene0070_00": {
					"bias_x": 0.36,
					"bias_y": -2.96,
					"bias_z": -2.6
				},
				"scene0072_00": {
					"bias_x": 2.93,
					"bias_y": -1.37,
					"bias_z": -1.27
				},
				"scene0075_00": {
					"bias_x": 4.01,
					"bias_y": 1.01,
					"bias_z": -1.51
				},
				"scene0078_00": {
					"bias_x": -1.13,
					"bias_y": 1.48,
					"bias_z": -1.3
				},
				"scene0079_00": {
					"bias_x": -2.72,
					"bias_y": 2.29,
					"bias_z": -2.08
				},
				"scene0082_00": {
					"bias_x": -0.85,
					"bias_y": 1.92,
					"bias_z": -0.84
				},
				"scene0086_00": {
					"bias_x": 0.95,
					"bias_y": -2.35,
					"bias_z": -1.43
				},
				"scene0087_00": {
					"bias_x": -2.86,
					"bias_y": 0.85,
					"bias_z": -1.58
				},
				"scene0088_00": {
					"bias_x": -0.63,
					"bias_y": 1.36,
					"bias_z": -0.78
				},
				"scene0089_00": {
					"bias_x": -1.78,
					"bias_y": 4.64,
					"bias_z": -1.67
				},
				"scene0091_00": {
					"bias_x": 2.16,
					"bias_y": -2.41,
					"bias_z": -1.73
				},
				"scene0093_00": {
					"bias_x": 2.83,
					"bias_y": 0.29,
					"bias_z": -1.3
				},
				"scene0101_00": {
					"bias_x": -0.58,
					"bias_y": 2.32,
					"bias_z": -1.45
				},
				"scene0104_00": {
					"bias_x": -0.49,
					"bias_y": -1.59,
					"bias_z": -0.57
				},
				"scene0105_00": {
					"bias_x": 1.01,
					"bias_y": 2.74,
					"bias_z": -1.89
				},
				"scene0108_00": {
					"bias_x": 0.62,
					"bias_y": 2.17,
					"bias_z": -1.05
				},
				"scene0111_00": {
					"bias_x": -1.69,
					"bias_y": 1.9,
					"bias_z": -0.63
				},
				"scene0116_00": {
					"bias_x": 3.19,
					"bias_y": -0.45,
					"bias_z": -1.56
				},
				"scene0117_00": {
					"bias_x": -0.34,
					"bias_y": 0.14,
					"bias_z": -1.43
				},
				"scene0118_00": {
					"bias_x": -2.01,
					"bias_y": 1.97,
					"bias_z": -1.8
				},
				"scene0126_00": {
					"bias_x": 0.56,
					"bias_y": -0.52,
					"bias_z": -1.07
				},
				"scene0133_00": {
					"bias_x": -0.49,
					"bias_y": 0.54,
					"bias_z": -0.69
				},
				"scene0135_00": {
					"bias_x": -1.65,
					"bias_y": 1.14,
					"bias_z": -2.22
				},
				"scene0136_00": {
					"bias_x": -3.36,
					"bias_y": -1.95,
					"bias_z": -1.77
				},
				"scene0137_00": {
					"bias_x": -3.13,
					"bias_y": -0.15,
					"bias_z": -3.23
				},
				"scene0141_00": {
					"bias_x": -1.25,
					"bias_y": 3.32,
					"bias_z": -1.59
				},
				"scene0144_00": {
					"bias_x": -0.24,
					"bias_y": 1.43,
					"bias_z": -1.15
				},
				"scene0146_00": {
					"bias_x": -1.55,
					"bias_y": 3.08,
					"bias_z": -1.66
				},
				"scene0149_00": {
					"bias_x": -4.45,
					"bias_y": 1.07,
					"bias_z": -1.39
				},
				"scene0150_00": {
					"bias_x": 1.14,
					"bias_y": 0.02,
					"bias_z": -0.42
				},
				"scene0153_00": {
					"bias_x": 1.23,
					"bias_y": 2.87,
					"bias_z": -1.14
				},
				"scene0159_00": {
					"bias_x": 0.24,
					"bias_y": 1.02,
					"bias_z": -1.26
				},
				"scene0161_00": {
					"bias_x": -1.71,
					"bias_y": 0.52,
					"bias_z": -2.82
				},
				"scene0165_00": {
					"bias_x": 1.26,
					"bias_y": -0.67,
					"bias_z": -1.73
				},
				"scene0166_00": {
					"bias_x": -2.56,
					"bias_y": 0.12,
					"bias_z": -1.12
				},
				"scene0167_00": {
					"bias_x": 0.4,
					"bias_y": 3.16,
					"bias_z": -1.51
				},
				"scene0168_00": {
					"bias_x": -1.27,
					"bias_y": 2.52,
					"bias_z": -0.53
				},
				"scene0169_00": {
					"bias_x": -2.94,
					"bias_y": 1.52,
					"bias_z": -0.95
				},
				"scene0173_00": {
					"bias_x": -1.98,
					"bias_y": 2.58,
					"bias_z": -0.98
				},
				"scene0175_00": {
					"bias_x": -0.42,
					"bias_y": -0.21,
					"bias_z": -1.22
				},
				"scene0178_00": {
					"bias_x": -2.03,
					"bias_y": 0.15,
					"bias_z": -1.51
				},
				"scene0181_00": {
					"bias_x": -1.05,
					"bias_y": 2.84,
					"bias_z": -0.72
				},
				"scene0188_00": {
					"bias_x": -0.75,
					"bias_y": -0.92,
					"bias_z": -1.54
				},
				"scene0190_00": {
					"bias_x": -0.14,
					"bias_y": 2.45,
					"bias_z": -1.05
				},
				"scene0195_00": {
					"bias_x": -0.29,
					"bias_y": -0.21,
					"bias_z": -0.46
				},
				"scene0205_00": {
					"bias_x": -1.36,
					"bias_y": 0.13,
					"bias_z": -1.36
				},
				"scene0206_00": {
					"bias_x": -1.97,
					"bias_y": 2.12,
					"bias_z": -0.76
				},
				"scene0210_00": {
					"bias_x": 2.5,
					"bias_y": -1.24,
					"bias_z": -1.25
				},
				"scene0214_00": {
					"bias_x": 0.72,
					"bias_y": 0.77,
					"bias_z": -2.14
				},
				"scene0215_00": {
					"bias_x": -0.34,
					"bias_y": 0.36,
					"bias_z": -1.07
				},
				"scene0223_00": {
					"bias_x": -0.9,
					"bias_y": 2.53,
					"bias_z": -1.37
				},
				"scene0228_00": {
					"bias_x": -2.25,
					"bias_y": -0.38,
					"bias_z": -1.49
				},
				"scene0236_00": {
					"bias_x": -3.39,
					"bias_y": -1.75,
					"bias_z": -1.35
				},
				"scene0237_00": {
					"bias_x": 2.08,
					"bias_y": -0.96,
					"bias_z": -1.77
				},
				"scene0246_00": {
					"bias_x": -0.46,
					"bias_y": -0.27,
					"bias_z": -1.07
				},
				"scene0247_00": {
					"bias_x": 1.61,
					"bias_y": 1.38,
					"bias_z": -0.52
				},
				"scene0249_00": {
					"bias_x": -2.01,
					"bias_y": -0.28,
					"bias_z": -1.17
				},
				"scene0250_00": {
					"bias_x": 0.04,
					"bias_y": 3.77,
					"bias_z": -4.53
				},
				"scene0256_00": {
					"bias_x": 4.1,
					"bias_y": -0.08,
					"bias_z": -1.58
				},
				"scene0257_00": {
					"bias_x": 0.49,
					"bias_y": -0.04,
					"bias_z": -1.87
				},
				"scene0259_00": {
					"bias_x": -0.4,
					"bias_y": 0.82,
					"bias_z": -2.25
				},
				"scene0260_00": {
					"bias_x": -2.57,
					"bias_y": -0.83,
					"bias_z": -1.25
				},
				"scene0267_00": {
					"bias_x": -4.01,
					"bias_y": -1.52,
					"bias_z": -1.77
				},
				"scene0268_00": {
					"bias_x": -2.87,
					"bias_y": 1.37,
					"bias_z": -1.43
				},
				"scene0275_00": {
					"bias_x": 2.05,
					"bias_y": 1.04,
					"bias_z": -1.05
				},
				"scene0278_00": {
					"bias_x": 0.31,
					"bias_y": 3.15,
					"bias_z": -1.35
				},
				"scene0280_00": {
					"bias_x": 0.36,
					"bias_y": -0.39,
					"bias_z": -1.17
				},
				"scene0281_00": {
					"bias_x": 2.77,
					"bias_y": 0.43,
					"bias_z": -1.27
				},
				"scene0285_00": {
					"bias_x": -0.39,
					"bias_y": 1.38,
					"bias_z": -1.23
				},
				"scene0289_00": {
					"bias_x": 1.07,
					"bias_y": 1.19,
					"bias_z": -1.25
				},
				"scene0291_00": {
					"bias_x": 1.28,
					"bias_y": -0.2,
					"bias_z": -1.37
				},
				"scene0298_00": {
					"bias_x": 2.61,
					"bias_y": 0.9,
					"bias_z": -0.78
				},
				"scene0301_00": {
					"bias_x": 1.25,
					"bias_y": 2.3,
					"bias_z": -1.49
				},
				"scene0303_00": {
					"bias_x": 0.54,
					"bias_y": 0.53,
					"bias_z": -0.72
				},
				"scene0304_00": {
					"bias_x": -0.49,
					"bias_y": 0.39,
					"bias_z": -0.7
				},
				"scene0314_00": {
					"bias_x": -1.17,
					"bias_y": -0.0,
					"bias_z": -1.29
				},
				"scene0318_00": {
					"bias_x": 4.27,
					"bias_y": 0.12,
					"bias_z": -2.1
				},
				"scene0319_00": {
					"bias_x": 0.71,
					"bias_y": 1.2,
					"bias_z": -1.05
				},
				"scene0321_00": {
					"bias_x": 0.37,
					"bias_y": 2.08,
					"bias_z": -1.77
				},
				"scene0323_00": {
					"bias_x": 1.88,
					"bias_y": 0.26,
					"bias_z": -1.52
				},
				"scene0328_00": {
					"bias_x": 1.65,
					"bias_y": -1.3,
					"bias_z": -1.73
				},
				"scene0338_00": {
					"bias_x": 0.69,
					"bias_y": -0.86,
					"bias_z": -1.23
				},
				"scene0339_00": {
					"bias_x": 2.67,
					"bias_y": 0.12,
					"bias_z": -1.41
				},
				"scene0344_00": {
					"bias_x": 3.68,
					"bias_y": -1.03,
					"bias_z": -1.71
				},
				"scene0347_00": {
					"bias_x": -0.45,
					"bias_y": 0.87,
					"bias_z": -0.58
				},
				"scene0351_00": {
					"bias_x": 3.89,
					"bias_y": -1.02,
					"bias_z": -1.46
				},
				"scene0355_00": {
					"bias_x": -3.25,
					"bias_y": 0.78,
					"bias_z": -0.94
				}
			}
		}
	}


	load_en_zh_obj_name(){
		this.obj_name_translation = {
			"copier": "复印机(copier)",
			"counter": "台面(counter)",
			"stapler": "订书机(stapler)",
			"wall": "墙(wall)",
			"boxes": "盒子(boxes)",
			"box": "盒子(box)",
			"floor": "地面(floor)",
			"door": "门(door)",
			"mailbox": "邮箱(mailbox)",
			"recycling bin": "回收箱(recycling bin)",
			"cabinets": "橱柜(cabinets)",
			"trash can": "垃圾桶(trash can)",
			"mailboxes": "信箱(mailboxes)",
			"chair": "椅子(chair)",
			"whiteboard": "白板(whiteboard)",
			"monitor": "显示器(monitor)",
			"radiator": "暖气片(radiator)",
			"windowsill": "窗台(windowsill)",
			"armchair": "扶手椅(armchair)",
			"keyboard": "键盘(keyboard)",
			"window": "窗户(window)",
			"table": "桌子(table)",
			"office chair": "办公椅(office chair)",
			"bathroom cabinet": "浴室柜(bathroom cabinet)",
			"plunger": "马桶疏通器(plunger)",
			"ceiling": "天花板(ceiling)",
			"light": "灯(light)",
			"towel": "毛巾(towel)",
			"scale": "秤(scale)",
			"plant": "植物(plant)",
			"bathroom counter": "浴室柜台面(bathroom counter)",
			"sink": "水槽(sink)",
			"toilet paper": "卫生纸(toilet paper)",
			"toilet": "马桶(toilet)",
			"doorframe": "门框(doorframe)",
			"mirror": "镜子(mirror)",
			"ceiling light": "天花板灯(ceiling light)",
			"bed": "床(bed)",
			"paper": "纸(paper)",
			"object": "杂物(object)",
			"lamp": "台灯(lamp)",
			"nightstand": "床头柜(nightstand)",
			"desk": "书桌(desk)",
			"closet door": "壁橱门(closet door)",
			"messenger bag": "邮差包(messenger bag)",
			"curtain": "窗帘(curtain)",
			"dresser": "梳妆台(dresser)",
			"printer": "打印机(printer)",
			"pillow": "枕头(pillow)",
			"shelf": "架子(shelf)",
			"clothing": "衣服(clothing)",
			"backpack": "背包(backpack)",
			"coffee table": "咖啡桌(coffee table)",
			"couch": "沙发(couch)",
			"pillar": "柱子(pillar)",
			"jacket": "夹克(jacket)",
			"wardrobe cabinet": "衣柜(wardrobe cabinet)",
			"closet": "壁橱(closet)",
			"calendar": "日历(calendar)",
			"shoes": "鞋(shoes)",
			"mini fridge": "迷你冰箱(mini fridge)",
			"decoration": "装饰品(decoration)",
			"book": "书(book)",
			"bowl": "碗(bowl)",
			"plate": "盘子(plate)",
			"jar": "罐(jar)",
			"bottle": "瓶子(bottle)",
			"bookshelf": "书架(bookshelf)",
			"laptop": "笔记本电脑(laptop)",
			"desk lamp": "台灯(desk lamp)",
			"blanket": "毯子(blanket)",
			"cup": "杯子(cup)",
			"soap dish": "肥皂盒(soap dish)",
			"bathtub": "浴缸(bathtub)",
			"mat": "垫子(mat)",
			"slippers": "拖鞋(slippers)",
			"toothbrush": "牙刷(toothbrush)",
			"stool": "凳子(stool)",
			"towels": "毛巾(towels)",
			"shower walls": "淋浴墙(shower walls)",
			"shower door": "淋浴门(shower door)",
			"microwave": "微波炉(microwave)",
			"kitchen cabinet": "厨房橱柜(kitchen cabinet)",
			"coffee box": "咖啡盒(coffee box)",
			"paper towel dispenser": "纸巾盒分配器(paper towel dispenser)",
			"fire extinguisher": "灭火器(fire extinguisher)",
			"refrigerator": "冰箱(refrigerator)",
			"coffee maker": "咖啡机(coffee maker)",
			"kitchen counter": "厨房柜台(kitchen counter)",
			"kitchen cabinets": "厨房橱柜(kitchen cabinets)",
			"toaster oven": "烤箱(toaster oven)",
			"trash bag": "垃圾袋(trash bag)",
			"pizza boxes": "披萨盒(pizza boxes)",
			"dishwasher": "洗碗机(dishwasher)",
			"telephone": "电话(telephone)",
			"picture": "图片(picture)",
			"computer tower": "电脑主机(computer tower)",
			"books": "图书(books)",
			"file cabinet": "文件柜(file cabinet)",
			"cabinet": "柜子(cabinet)",
			"curtains": "窗帘(curtains)",
			"toilet flush button": "马桶冲水按钮(toilet flush button)",
			"suitcase": "手提箱(suitcase)",
			"clothes": "衣服(clothes)",
			"ledge": "窗台壁架(ledge)",
			"shower curtain": "浴帘(shower curtain)",
			"wardrobe": "衣柜(wardrobe)",
			"light switch": "灯开关(light switch)",
			"tv": "电视(tv)",
			"luggage stand": "行李架(luggage stand)",
			"lamp base": "灯座(lamp base)",
			"vent": "通风口(vent)",
			"furniture": "家具(furniture)",
			"toilet paper dispenser": "卫生纸分配器(toilet paper dispenser)",
			"bar": "吧台(bar)",
			"rod": "杆子(rod)",
			"dispenser": "取物器(dispenser)",
			"soap dispenser": "洗手液分配器(soap dispenser)",
			"trash bin": "垃圾桶(trash bin)",
			"bathroom stall door": "浴室隔间门(bathroom stall door)",
			"bathroom vanity": "浴室盥洗台(bathroom vanity)",
			"bucket": "桶(bucket)",
			"bulletin board": "布告栏(bulletin board)",
			"structure": "结构(structure)",
			"container": "容器(container)",
			"elevator": "升降机(elevator)",
			"stair rail": "楼梯扶手(stair rail)",
			"basket": "篮子(basket)",
			"stairs": "楼梯(stairs)",
			"beer bottles": "啤酒瓶(beer bottles)",
			"dish rack": "碗碟架(dish rack)",
			"soda stream": "苏打水(soda stream)",
			"bag of coffee beans": "一袋咖啡豆(bag of coffee beans)",
			"paper towel roll": "纸巾卷(paper towel roll)",
			"toaster": "烤面包机(toaster)",
			"salt": "盐(salt)",
			"stove": "炉灶(stove)",
			"bag": "包(bag)",
			"coffee kettle": "咖啡壶(coffee kettle)",
			"range hood": "抽油烟机(range hood)",
			"carton": "纸盒(carton)",
			"water bottle": "水瓶(water bottle)",
			"ironing board": "熨衣板(ironing board)",
			"bench": "长凳(bench)",
			"hair dryer": "电吹风(hair dryer)",
			"iron": "熨斗(iron)",
			"clothes hanger": "衣架(clothes hanger)",
			"shoe": "鞋(shoe)",
			"board": "板(board)",
			"mattress": "床垫(mattress)",
			"smoke detector": "烟雾探测器(smoke detector)",
			"round table": "圆桌(round table)",
			"bathroom stall": "浴室隔间(bathroom stall)",
			"rail": "轨道(rail)",
			"shower curtain rod": "浴帘杆(shower curtain rod)",
			"stand": "底座(stand)",
			"dumbbell": "哑铃(dumbbell)",
			"doors": "门(doors)",
			"hose": "水管(hose)",
			"laundry hamper": "洗衣篮(laundry hamper)",
			"fan": "扇子(fan)",
			"poster": "海报(poster)",
			"ottoman": "脚凳(ottoman)",
			"end table": "边桌(end table)",
			"blinds": "百叶窗(blinds)",
			"ball": "球(ball)",
			"binders": "文件夹(binders)",
			"poster tube": "海报筒(poster tube)",
			"water cooler": "水冷却器(water cooler)",
			"wardrobe closet": "衣柜(wardrobe closet)",
			"shower": "淋浴间(shower)",
			"clock": "钟(clock)",
			"chest": "箱柜(chest)",
			"diaper bin": "尿布桶(diaper bin)",
			"crib": "婴儿床(crib)",
			"baby mobile": "婴儿床吊饰(baby mobile)",
			"person": "人(person)",
			"closet doors": "壁橱门(closet doors)",
			"bicycle": "自行车(bicycle)",
			"oven": "烤箱(oven)",
			"bananas": "香蕉(bananas)",
			"guitar": "吉他(guitar)",
			"tissue box": "纸巾盒(tissue box)",
			"cone": "锥体(cone)",
			"exercise ball": "健身球(exercise ball)",
			"crate": "收纳箱(crate)",
			"boiler": "锅炉(boiler)",
			"tray": "托盘(tray)",
			"pipe": "管道(pipe)",
			"folded table": "折叠桌(folded table)",
			"tupperware": "保鲜盒(tupperware)",
			"cart": "手拉车(cart)",
			"handicap bar": "扶手(handicap bar)",
			"toilet paper holder": "卫生纸架(toilet paper holder)",
			"pillows": "枕头(pillows)",
			"lunch box": "饭盒(lunch box)",
			"clothes dryer": "干衣机(clothes dryer)",
			"broom": "扫帚(broom)",
			"dustpan": "簸箕(dustpan)",
			"washing machine": "洗衣机(washing machine)",
			"sofa chair": "沙发椅(sofa chair)",
			"power outlet": "电源插座(power outlet)",
			"plastic containers": "塑料容器(plastic containers)",
			"banner": "横幅(banner)",
			"tube": "管子(tube)",
			"carseat": "车座椅(carseat)",
			"storage bin": "储物箱(storage bin)",
			"fireplace": "壁炉(fireplace)",
			"bookshelves": "书架(bookshelves)",
			"purse": "钱包(purse)",
			"paper bag": "纸袋(paper bag)",
			"ceiling fan": "吊扇(ceiling fan)",
			"hat": "帽子(hat)",
			"tv stand": "电视柜(tv stand)",
			"mouse": "鼠标(mouse)",
			"laundry basket": "洗衣篮(laundry basket)",
			"guitar case": "吉他盒(guitar case)",
			"mail": "邮件(mail)",
			"storage shelf": "储物架(storage shelf)",
			"painting": "绘画(painting)",
			"candle": "蜡烛(candle)",
			"exercise machine": "健身器(exercise machine)",
			"treadmill": "跑步机(treadmill)",
			"elliptical machine": "椭圆机(elliptical machine)",
			"stepstool": "梯凳(stepstool)",
			"paper tray": "纸盘(paper tray)",
			"paper shredder": "碎纸机(paper shredder)",
			"shower wall": "淋浴墙(shower wall)",
			"shower floor": "淋浴地板(shower floor)",
			"kettle": "壶(kettle)",
			"wet floor sign": "地板湿滑标志(wet floor sign)",
			"closet walls": "壁橱墙壁(closet walls)",
			"changing station": "换尿布台(changing station)",
			"envelope": "信封(envelope)",
			"blackboard": "黑板(blackboard)",
			"papers": "文件(papers)",
			"coat": "外套(coat)",
			"ladder": "梯子(ladder)",
			"sign": "标牌(sign)",
			"kitchen island": "厨房操作台(kitchen island)",
			"couch cushions": "沙发垫(couch cushions)",
			"shampoo bottle": "洗发水瓶(shampoo bottle)",
			"contact lens solution bottle": "隐形眼镜护理液瓶(contact lens solution bottle)",
			"conditioner bottle": "护发素瓶(conditioner bottle)",
			"dining table": "餐桌(dining table)",
			"seat": "座位(seat)",
			"paper cutter": "切纸机(paper cutter)",
			"alarm clock": "闹钟(alarm clock)",
			"luggage": "行李(luggage)",
			"folder": "文件夹(folder)",
			"bear": "玩具熊(bear)",
			"thermostat": "温控器(thermostat)",
			"table lamp": "台灯(table lamp)",
			"shower control valve": "淋浴控制阀(shower control valve)",
			"soap bottle": "肥皂瓶(soap bottle)",
			"magazine": "杂志(magazine)",
			"power strip": "电源插排(power strip)",
			"battery disposal jar": "电池回收罐(battery disposal jar)",
			"shaving cream": "剃须膏(shaving cream)",
			"carpet": "地毯(carpet)",
			"exit sign": "出口标志(exit sign)",
			"case": "收纳盒(case)",
			"projector": "投影仪(projector)",
			"folded chair": "折叠椅(folded chair)",
			"closet wall": "壁橱墙(closet wall)",
			"storage organizer": "储物收纳盒(storage organizer)",
			"boxes of paper": "纸盒(boxes of paper)",
			"vending machine": "售货机(vending machine)",
			"washing machines": "洗衣机(washing machines)",
			"clothes dryers": "干衣机(clothes dryers)",
			"piano": "钢琴(piano)",
			"shower faucet handle": "淋浴龙头手柄(shower faucet handle)",
			"speaker": "扬声器(speaker)",
			"ikea bag": "宜家包(ikea bag)",
			"xbox controller": "Xbox 控制器(xbox controller)",
			"fire alarm": "火灾警报(fire alarm)",
			"music stand": "乐谱架(music stand)",
			"door wall": "门墙(door wall)",
			"divider": "分隔栏(divider)",
			"barricade": "障碍(barricade)",
			"water fountain": "饮水机(water fountain)",
			"globe": "地球仪(globe)",
			"piano bench": "钢琴凳(piano bench)",
			"vacuum cleaner": "吸尘器(vacuum cleaner)",
			"wheel": "车轮(wheel)",
			"rack": "架子(rack)",
			"potted plant": "盆栽(potted plant)",
			"keyboard piano": "电子琴(keyboard piano)",
			"music book": "乐谱书(music book)",
			"hand rail": "扶手(hand rail)",
			"pitcher": "水壶(pitcher)",
			"soap bar": "肥皂(soap bar)",
			"soap": "肥皂(soap)",
			"toilet brush": "马桶刷(toilet brush)",
			"stack of cups": "一摞杯子(stack of cups)",
			"vase": "花瓶(vase)",
			"thermos": "热水瓶(thermos)",
			"crutches": "拐杖(crutches)",
			"heater": "加热器(heater)",
			"toilet seat cover dispenser": "马桶盖分配器(toilet seat cover dispenser)",
			"plastic container": "塑料容器(plastic container)",
			"shower doors": "淋浴门(shower doors)",
			"bin": "桶(bin)",
			"shower head": "淋浴喷头(shower head)",
			"bathrobe": "浴衣(bathrobe)",
			"towel rack": "毛巾架(towel rack)",
			"grab bar": "扶手(grab bar)",
			"case of water bottles": "水瓶箱(case of water bottles)",
			"flip flops": "人字拖(flip flops)",
			"luggage rack": "行李架(luggage rack)",
			"poster printer": "海报打印机(poster printer)",
			"boards": "板(boards)",
			"poster cutter": "海报切割机(poster cutter)",
			"rolled poster": "卷式海报(rolled poster)",
			"projector screen": "投影仪屏幕(projector screen)",
			"pipes": "管道(pipes)",
			"bottles": "瓶(bottles)",
			"closet rod": "衣柜杆(closet rod)",
			"compost bin": "堆肥箱(compost bin)",
			"teddy bear": "玩具熊(teddy bear)",
			"mirror doors": "镜门(mirror doors)",
			"boat": "玩具船(boat)",
			"helmet": "头盔(helmet)",
			"doll": "玩具娃娃(doll)",
			"toilet paper rolls": "卫生纸卷(toilet paper rolls)",
			"handrail": "扶手(handrail)",
			"stack of chairs": "一堆椅子(stack of chairs)",
			"cushion": "坐垫(cushion)",
			"column": "柱子(column)",
			"coat rack": "衣帽架(coat rack)",
			"frying pan": "煎锅(frying pan)",
			"cooking pan": "烹饪锅(cooking pan)",
			"headphones": "耳机(headphones)",
			"sweater": "毛衣(sweater)",
			"water pitcher": "水罐(water pitcher)",
			"wall hanging": "壁挂(wall hanging)",
			"dumbbell plates": "哑铃片(dumbbell plates)",
			"footrest": "脚凳(footrest)",
			"faucet": "水龙头(faucet)",
			"cooking pot": "锅(cooking pot)",
			"card": "卡片(card)",
			"open kitchen cabinet": "开放式厨房橱柜(open kitchen cabinet)",
			"tea kettle": "茶壶(tea kettle)",
			"lotion": "乳液(lotion)",
			"buddha": "佛(buddha)",
			"blackboard eraser": "黑板擦(blackboard eraser)",
			"whiteboard eraser": "白板擦(whiteboard eraser)",
			"toiletry": "洗漱用品(toiletry)",
			"cd case": "CD盒(cd case)",
			"flag": "旗帜(flag)",
			"foosball table": "桌上足球台(foosball table)",
			"dumbell": "哑铃(dumbell)",
			"staircase": "楼梯(staircase)",
			"remote": "遥控器(remote)",
			"pot": "锅(pot)",
			"shoe rack": "鞋架(shoe rack)",
			"storage container": "储物容器(storage container)",
			"storage box": "储物盒(storage box)",
			"cloth": "布(cloth)",
			"drawer": "抽屉(drawer)",
			"dollhouse": "玩偶屋(dollhouse)",
			"rope": "绳索(rope)",
			"photo": "照片(photo)",
			"shirt": "衬衫(shirt)",
			"cd cases": "CD盒(cd cases)",
			"folded ladder": "折叠梯(folded ladder)",
			"instrument case": "乐器盒(instrument case)",
			"sleeping bag": "睡袋(sleeping bag)",
			"shorts": "短裤(shorts)",
			"dart board": "飞镖靶(dart board)",
			"bunk bed": "双层床(bunk bed)",
			"dress rack": "衣架(dress rack)",
			"coatrack": "衣帽架(coatrack)",
			"frame": "框架(frame)",
			"beanbag chair": "豆袋椅(beanbag chair)",
			"folded chairs": "折叠椅(folded chairs)",
			"machine": "机器(machine)",
			"spray bottle": "喷雾瓶(spray bottle)",
			"cutting board": "切菜板(cutting board)",
			"suitcases": "手提箱(suitcases)",
			"swiffer": "拖把(swiffer)",
			"magazine rack": "杂志架(magazine rack)",
			"food display": "食品展示柜(food display)",
			"cover": "盖子(cover)",
			"loft bed": "阁楼床(loft bed)",
			"traffic cone": "交通锥(traffic cone)",
			"dishwashing soap bottle": "洗洁精瓶(dishwashing soap bottle)",
			"sponge": "海绵(sponge)",
			"bycicle": "自行车(bycicle)",
			"subwoofer": "低音扬声器(subwoofer)",
			"clip": "夹子(clip)",
			"coffee bean bag": "咖啡豆袋(coffee bean bag)",
			"flowerpot": "花盆(flowerpot)",
			"pictures": "图片(pictures)",
			"laundry detergent": "洗衣粉(laundry detergent)",
			"futon": "折叠床(futon)",
			"step stool": "脚凳(step stool)",
			"toolbox": "工具箱(toolbox)",
			"cooler": "冷却器(cooler)",
			"hand dryer": "手部干燥器(hand dryer)",
			"cabinet door": "橱柜门(cabinet door)",
			"bath walls": "浴室墙壁(bath walls)",
			"lotion bottle": "乳液瓶(lotion bottle)",
			"shampoo": "洗发水(shampoo)",
			"airplane": "飞机(airplane)",
			"cups": "杯子(cups)",
			"stuffed animal": "毛绒动物(stuffed animal)",
			"washcloth": "面巾(washcloth)",
			"breakfast bar": "早餐吧(breakfast bar)",
			"duffel bag": "旅行袋(duffel bag)",
			"hoverboard": "滑板(hoverboard)",
			"metronome": "节拍器(metronome)",
			"legs": "家具腿(legs)",
			"footstool": "脚凳(footstool)",
			"statue": "雕像(statue)",
			"easel": "画架(easel)",
			"pool table": "台球桌(pool table)",
			"closet ceiling": "壁橱天花板(closet ceiling)",
			"display rack": "展示架(display rack)",
			"paper organizer": "纸张整理器(paper organizer)",
			"air hockey table": "空气曲棍球桌(air hockey table)",
			"shredder": "碎纸机(shredder)",
			"mail tray": "信件托盘(mail tray)",
			"tennis racket": "网球拍(tennis racket)",
			"quadcopter": "四轴飞行器(quadcopter)",
			"ipad": "iPad(ipad)",
			"humidifier": "加湿器(humidifier)",
			"railing": "栏杆(railing)",
			"hanging": "悬挂物(hanging)",
			"drying rack": "晾衣架(drying rack)",
			"water heater": "热水器(water heater)",
			"beachball": "沙滩球(beachball)",
			"oven mitt": "烤箱手套(oven mitt)",
			"toothpaste": "牙膏(toothpaste)",
			"podium": "讲台(podium)",
			"step": "台阶(step)",
			"hatrack": "帽架(hatrack)",
			"chain": "链子(chain)",
			"kitchen apron": "厨房围裙(kitchen apron)",
			"kitchenaid mixer": "自助搅拌机(kitchenaid mixer)",
			"knife block": "刀架(knife block)",
			"display case": "展示柜(display case)",
			"clothing rack": "衣服架(clothing rack)",
			"closet wardrobe": "壁橱(closet wardrobe)",
			"tray rack": "托盘架(tray rack)",
			"rug": "小地毯(rug)",
			"loofa": "浴用丝球(loofa)",
			"hand towel": "手巾(hand towel)",
			"scanner": "扫描器(scanner)",
			"alarm": "警报(alarm)",
			"sofa bed": "沙发床(sofa bed)",
			"glass doors": "玻璃门(glass doors)",
			"dryer sheets": "烘干纸巾(dryer sheets)",
			"urinal": "小便池(urinal)",
			"pantry shelf": "食品储藏架(pantry shelf)",
			"pantry walls": "食品储藏室的墙壁(pantry walls)",
			"bike pump": "自行车打气筒(bike pump)",
			"ping pong table": "乒乓球桌(ping pong table)",
			"roomba": "扫地机器人(roomba)",
			"paper towel rolls": "纸巾卷(paper towel rolls)",
			"plastic bin": "塑料垃圾桶(plastic bin)",
			"mug": "马克杯(mug)",
			"covered box": "有盖盒(covered box)",
			"laundry bag": "洗衣袋(laundry bag)",
			"nerf gun": "软弹枪(nerf gun)",
			"organizer shelf": "收纳架(organizer shelf)",
			"boots": "靴子(boots)",
			"tank": "水箱(tank)",
			"car": "玩具车(car)",
			"garage door": "车库门(garage door)",
			"night lamp": "小夜灯(night lamp)",
			"stacks of cups": "一堆杯子(stacks of cups)",
			"star": "星星(star)",
			"studio light": "摄影棚灯光(studio light)",
			"switch": "开关(switch)",
			"screen": "屏幕(screen)",
			"chandelier": "吊灯(chandelier)",
			"banana holder": "香蕉架(banana holder)",
			"yoga mat": "瑜伽垫(yoga mat)",
			"medal": "勋章(medal)",
			"rice cooker": "电饭锅(rice cooker)",
			"platform": "平台基座(platform)",
			"can": "罐头(can)",
			"stair": "楼梯(stair)",
			"stick": "棍子(stick)",
			"organizer": "收纳箱(organizer)",
			"slipper": "拖鞋(slipper)",
			"gaming wheel": "游戏轮盘(gaming wheel)",
			"sliding door": "滑动门(sliding door)",
			"kitchen mixer": "厨房搅拌机(kitchen mixer)",
			"umbrella": "伞(umbrella)",
			"tire": "胎(tire)",
			"cardboard": "纸板(cardboard)",
			"food container": "食物容器(food container)",
			"sock": "短袜(sock)",
			"pants": "裤子(pants)",
			"bath products": "沐浴产品(bath products)",
			"fish": "鱼(fish)",
			"binder": "文件夹(binder)",
			"coffee mug": "咖啡杯(coffee mug)",
			"tripod": "三脚架(tripod)",
			"hamper": "洗衣篮(hamper)",
			"closet doorframe": "壁橱门框(closet doorframe)",
			"golf bag": "高尔夫球袋(golf bag)",
			"cat litter box": "猫砂盆(cat litter box)",
			"dolly": "手推车(dolly)",
			"costume": "戏服(costume)",
			"hand sanitzer dispenser": "洗手液分配器(hand sanitzer dispenser)",
			"headboard": "床头板(headboard)",
			"wall lamp": "壁灯(wall lamp)",
			"camera": "相机(camera)",
			"garbage bag": "垃圾袋(garbage bag)",
			"kinect": "体感游戏控制器(kinect)",
			"cabinet doors": "橱柜门(cabinet doors)",
			"workbench": "工作台(workbench)",
			"sewing machine": "缝纫机(sewing machine)",
			"closet shelf": "壁橱架子(closet shelf)",
			"trash cabinet": "垃圾柜(trash cabinet)",
			"briefcase": "公文包(briefcase)",
			"massage chair": "按摩椅(massage chair)",
			"map": "地图(map)",
			"pantry wall": "储藏室墙(pantry wall)",
			"pizza box": "披萨盒(pizza box)",
			"centerpiece": "中心装饰(centerpiece)",
			"side table": "边桌(side table)",
			"media center": "多媒体中心(media center)",
			"elevator button": "升降机按钮(elevator button)",
			"file organizer": "文件整理器(file organizer)",
			"trunk": "行李箱(trunk)",
			"starbucks cup": "星巴克杯(starbucks cup)",
			"seating": "座位(seating)",
			"sticker": "贴纸(sticker)",
			"tennis racket bag": "网球拍袋(tennis racket bag)",
			"telescope": "望远镜(telescope)",
			"santa": "圣诞老人(santa)",
			"folded boxes": "折叠盒(folded boxes)",
			"sofa": "沙发(sofa)",
			"mail bin": "邮箱(mail bin)",
			"ceiling lamp": "顶灯(ceiling lamp)",
			"stools": "凳子(stools)",
			"wood beam": "木梁(wood beam)",
			"bedframe": "床架(bedframe)",
			"shopping bag": "购物袋(shopping bag)",
			"hair brush": "毛刷(hair brush)",
			"mouthwash bottle": "漱口水瓶(mouthwash bottle)",
			"air mattress": "充气床垫(air mattress)",
			"canopy": "遮阳蓬(canopy)",
			"clothes hangers": "衣架(clothes hangers)",
			"wall mounted coat rack": "壁挂式衣帽架(wall mounted coat rack)",
			"wig": "假发(wig)",
			"jewelry box": "珠宝盒(jewelry box)",
			"file cabinets": "文件柜(file cabinets)",
			"rocking chair": "摇椅(rocking chair)",
			"soda can": "汽水罐(soda can)",
			"toy piano": "玩具钢琴(toy piano)",
			"display sign": "显示标志(display sign)",
			"block": "木塞子(block)",
			"closet floor": "壁橱地板(closet floor)",
			"fire hose": "消防水带(fire hose)",
			"plastic storage bin": "塑料储物箱(plastic storage bin)",
			"night light": "夜灯(night light)",
			"cap": "帽子(cap)",
			"baby changing station": "婴儿换尿布台(baby changing station)",
			"postcard": "明信片(postcard)",
			"baseball cap": "棒球帽(baseball cap)",
			"toilet paper package": "卫生纸包装(toilet paper package)",
			"film light": "电影灯(film light)",
			"drum set": "鼓组(drum set)",
			"banister": "栏杆(banister)",
			"tap": "水龙头(tap)",
			"cable": "电缆(cable)",
			"toy dinosaur": "玩具恐龙(toy dinosaur)",
			"mop": "拖把(mop)",
			"mail trays": "邮件托盘(mail trays)",
			"electric panel": "电气面板(electric panel)",
			"stack of folded chairs": "一叠折叠椅(stack of folded chairs)",
			"sliding wood door": "滑动木门(sliding wood door)",
			"pen holder": "笔筒(pen holder)",
			"stovetop": "灶台(stovetop)",
			"trolley": "手推车(trolley)",
			"furnace": "炉子(furnace)",
			"fuse box": "保险丝盒(fuse box)",
			"socks": "袜子(socks)",
			"grocery bag": "购物袋(grocery bag)",
			"book rack": "书架(book rack)",
			"rack stand": "架子(rack stand)",
			"flower stand": "花架(flower stand)",
			"stepladder": "梯子(stepladder)",
			"tape": "磁带(tape)",
			"teapot": "茶壶(teapot)",
			"bike lock": "自行车锁(bike lock)",
			"exercise bike": "健身车(exercise bike)",
			"water softener": "水质软化器(water softener)",
			"wood": "木制品(wood)",
			"notepad": "记事本(notepad)",
			"cosmetic bag": "化妆包(cosmetic bag)",
			"glass": "玻璃(glass)",
			"ping pong paddle": "乒乓球拍(ping pong paddle)",
			"food bag": "食品袋(food bag)",
			"plates": "盘子(plates)",
			"fire sprinkler": "消防喷头(fire sprinkler)",
			"recliner chair": "躺椅(recliner chair)",
			"display": "展示台(display)",
			"barrier": "障碍(barrier)",
			"controller": "控制器(controller)",
			"paper towel": "纸巾(paper towel)",
			"curtain rod": "窗帘杆(curtain rod)",
			"planter box": "种植箱(planter box)",
			"power socket": "电源插座(power socket)",
			"light box": "灯箱(light box)",
			"payment terminal": "刷卡机(payment terminal)",
			"table card": "桌卡(table card)",
			"book scanner": "书籍扫描仪(book scanner)",
			"napkin": "餐巾(napkin)",
			"detergent": "洗涤剂(detergent)",
			"touchpad": "触摸板(touchpad)",
			"card reader": "读卡器(card reader)",
			"whiteboard detergent": "白板清洁剂(whiteboard detergent)",
			"pc": "个人电脑(pc)",
			"detergent bottle": "洗涤剂瓶(detergent bottle)",
			"dryer sheet box": "烘干纸盒(dryer sheet box)",
			"dryer": "烘干机(dryer)",
			"wall cabinet": "壁柜(wall cabinet)",
			"fabric softener box": "织物柔软剂盒(fabric softener box)",
			"light base": "灯底座(light base)",
			"beam": "梁(beam)",
			"electric switch": "电开关(electric switch)",
			"pot lid": "锅盖(pot lid)",
			"electric socket": "电源插座(electric socket)",
			"bagels": "贝果(bagels)",
			"electric range": "电炉(electric range)",
			"oranges": "橘子(oranges)",
			"bread": "面包(bread)",
			"stacked bowls": "碗堆(stacked bowls)",
			"hand soap": "洗手液(hand soap)",
			"bifold door": "折叠门(bifold door)",
			"velvet hangers": "天鹅绒衣架(velvet hangers)",
			"computer case": "电脑机箱(computer case)",
			"scarf": "围巾(scarf)",
			"plush toy": "毛绒玩具(plush toy)",
			"air conditioner": "空调(air conditioner)",
			"napkin roll": "餐巾卷(napkin roll)",
			"toilet plunger": "马桶疏通器(toilet plunger)",
			"glass door": "玻璃门(glass door)",
			"faucet switch": "水龙头开关(faucet switch)",
			"roll paper": "卷纸(roll paper)",
			"wash stand": "盥洗台(wash stand)",
			"gloves": "手套(gloves)",
			"dishcloth": "抹布(dishcloth)",
			"basin": "盆,洗手槽(basin)",
			"coffee machine": "咖啡机(coffee machine)",
			"curtain box": "窗帘盒(curtain box)",
			"safe": "保险柜(safe)",
			"air conditioner controller": "空调控制器(air conditioner controller)",
			"floor lamp": "落地灯(floor lamp)",
			"remote control": "遥控器(remote control)",
			"tv box": "电视盒(tv box)",
			"stall wall": "隔间墙(stall wall)",
			"pit toilet": "旱厕(pit toilet)",
			"pedestal urinal covered": "座便器盖子(pedestal urinal covered)",
			"pedestal urinal": "座便器(pedestal urinal)",
			"stacked chairs": "叠放的椅子(stacked chairs)",
			"hand sanitizer": "消毒洗手液(hand sanitizer)",
			"air vent": "通风口(air vent)",
			"napkin box": "餐巾盒(napkin box)",
			"stacked cups": "杯子堆(stacked cups)",
			"bidet": "坐浴盆(bidet)",
			"cornice molding": "窗檐线(cornice molding)",
			"wall light": "壁灯(wall light)",
			"bathtub base": "浴缸底座(bathtub base)",
			"sink cabinet": "洗手池柜(sink cabinet)",
			"tablet": "平板电脑(tablet)",
			"guide": "指南(guide)",
			"kitchen tool": "厨房工具(kitchen tool)",
			"trash": "垃圾(trash)",
			"tooth mug": "刷牙杯(tooth mug)",
			"door frame": "门框(door frame)",
			"showerhead": "淋浴喷头(showerhead)",
			"toilet roll": "卫生纸(toilet roll)",
			"cardboard holder": "纸板支架(cardboard holder)",
			"comb": "梳子(comb)",
			"plastic bag": "塑料袋(plastic bag)",
			"floor otherroom": "楼层房间(floor otherroom)",
			"low wall": "矮墙(low wall)",
			"cable manager": "电缆管理器(cable manager)",
			"baseboard": "底板(baseboard)",
			"refill pouch": "补充袋(refill pouch)",
			"rag": "抹布(rag)",
			"broom head": "扫帚头(broom head)",
			"door curtain": "门帘(door curtain)",
			"chopping board": "案板(chopping board)",
			"gas range": "煤气灶(gas range)",
			"electrical panel": "电气面板(electrical panel)",
			"panel": "面板(panel)",
			"plastic box": "塑料盒(plastic box)",
			"pile of cloth": "一堆布(pile of cloth)",
			"scissor": "剪刀(scissor)",
			"surface": "表面(surface)",
			"mouse pad": "鼠标垫(mouse pad)",
			"exhaust fan vent": "排气扇通风口(exhaust fan vent)",
			"brush": "刷子(brush)",
			"basin stand": "水盆架(basin stand)",
			"water tank": "水箱(water tank)",
			"advertising board": "广告牌(advertising board)",
			"sanitation station": "卫生站(sanitation station)",
			"fire extinguisher cabinet": "灭火器柜(fire extinguisher cabinet)",
			"plant pot": "花盆(plant pot)",
			"threshold": "门槛(threshold)",
			"wall shelf": "墙边架子(wall shelf)",
			"sink drain": "水槽排水口(sink drain)",
			"floor drain": "地漏(floor drain)",
			"bathroom heater": "浴室取暖器(bathroom heater)",
			"gate": "门(gate)",
			"clothes rail": "晾衣杆(clothes rail)",
			"bird ceramics": "陶瓷(bird ceramics)",
			"wall speaker": "壁挂式音箱(wall speaker)",
			"document holder": "文件夹(document holder)",
			"electric kettle": "电热水壶(electric kettle)",
			"woodcarving": "木雕(woodcarving)",
			"pen": "笔(pen)",
			"knot artwork": "结绳艺术品(knot artwork)",
			"sphygmomanometer": "血压计(sphygmomanometer)",
			"wall decoration": "墙面装饰(wall decoration)",
			"rangehood": "抽油烟机(rangehood)",
			"range": "灶具(range)",
			"wall otherroom": "房间墙壁(wall otherroom)",
			"ticket": "票(ticket)",
			"blankets": "毯子(blankets)",
			"bags": "包(bags)",
			"quilt": "被子(quilt)",
			"base": "底座(base)",
			"landline telephone": "固定电话(landline telephone)",
			"hole puncher": "打孔器(hole puncher)",
			"adjustable desk": "可调节书桌(adjustable desk)",
			"planter": "播种机(planter)",
			"footstep": "台阶(footstep)",
			"radiator shell": "散热器壳(radiator shell)",
			"parapet": "矮墙(parapet)",
			"circular plate": "圆盘(circular plate)",
			"trash bin lid": "垃圾桶盖(trash bin lid)",
			"watter bottle": "水瓶(watter bottle)",
			"cuttting board": "案板(cuttting board)",
			"water faucet": "水龙头(water faucet)",
			"pot cover": "锅盖(pot cover)",
			"rice maker": "电饭锅(rice maker)",
			"steel ball": "钢球(steel ball)",
			"objects": "杂物(objects)",
			"ricemaker": "电饭锅(ricemaker)",
			"paperbin": "纸篓(paperbin)",
			"sneaker": "运动鞋(sneaker)",
			"trashbin": "垃圾桶(trashbin)",
			"rice bag": "米袋(rice bag)",
			"potted planet": "盆栽植物(potted planet)",
			"wall storage set": "墙壁收纳套件(wall storage set)",
			"ceiling decoration": "天花板装饰(ceiling decoration)",
			"automated teller machine": "自动柜员机(automated teller machine)",
			"map board": "地图板(map board)",
			"liquor box": "酒盒(liquor box)",
			"crock": "瓦罐(crock)",
			"cornice": "窗檐口(cornice)",
			"wine cabinet": "酒柜(wine cabinet)",
			"electric pressure cooker": "电压力锅(electric pressure cooker)",
			"wall frame": "墙架(wall frame)",
			"computer table": "电脑桌(computer table)",
			"tissue bag": "纸巾袋(tissue bag)",
			"paper bin": "纸篓(paper bin)",
			"bar table": "吧台桌(bar table)",
			"shoe box": "鞋盒(shoe box)",
			"fridge": "冰箱(fridge)",
			"bouquet": "花束(bouquet)",
			"wall mounted telephone": "壁挂电话(wall mounted telephone)",
			"toy": "玩具(toy)",
			"paper cup": "纸杯(paper cup)",
			"floor light": "落地灯(floor light)",
			"handkerchief": "手帕(handkerchief)",
			"back cushion": "靠垫(back cushion)",
			"cat kennel": "猫窝(cat kennel)",
			"window blinds": "百叶窗(window blinds)",
			"drawer unit": "抽屉单元(drawer unit)",
			"toy doll": "玩具娃娃(toy doll)",
			"ukulele bag": "尤克里里包(ukulele bag)",
			"dust pan": "簸箕(dust pan)",
			"litter box": "垃圾箱(litter box)",
			"utensil holder": "餐具架(utensil holder)",
			"air fryer": "空气炸锅(air fryer)",
			"cellphone": "手机(cellphone)",
			"scissors": "剪刀(scissors)",
			"shower faucet": "淋浴龙头(shower faucet)",
			"bath sponge": "沐浴海绵(bath sponge)",
			"window trim": "窗户装饰(window trim)",
			"shoe cabinet": "鞋柜(shoe cabinet)",
			"panda doll": "熊猫娃娃(panda doll)",
			"yoga mat roll": "瑜伽垫卷(yoga mat roll)",
			"wire": "金属丝(wire)",
			"clutter": "杂物(clutter)",
			"rake": "耙(rake)",
			"door sill": "门槛(door sill)",
			"sofa cushion": "沙发垫(sofa cushion)",
			"wood fence": "木栅栏(wood fence)",
			"tv cabinet": "电视柜(tv cabinet)",
			"soap holder": "肥皂架(soap holder)",
			"plug": "插头(plug)",
			"dragon fruit": "火龙果(dragon fruit)",
			"wall paper": "墙纸(wall paper)",
			"bed net": "蚊帐(bed net)",
			"card board": "纸板(card board)",
			"pile of blankets": "一堆毯子(pile of blankets)",
			"tissue": "纸巾(tissue)",
			"power strips": "电源板(power strips)",
			"tableware": "餐具(tableware)",
			"table divider": "桌子隔板(table divider)",
			"poster board": "海报板(poster board)",
			"pencil sharpener": "卷笔刀(pencil sharpener)",
			"sealing machine": "密封机(sealing machine)",
			"router": "路由器(router)",
			"wallet": "钱包(wallet)",
			"car key": "车钥匙(car key)",
			"watch": "手表(watch)",
			"mask": "面具口罩(mask)",
			"ashtray": "烟灰缸(ashtray)",
			"tea pot": "茶壶(tea pot)",
			"ornament": "装饰品(ornament)",
			"flower": "花(flower)",
			"armrest": "扶手(armrest)",
			"computer desk": "电脑桌(computer desk)",
			"paper trimmer": "裁纸机(paper trimmer)",
			"power socket case": "电源插座外壳(power socket case)",
			"flatware set": "餐具套装(flatware set)",
			"lid rack": "盖子架(lid rack)",
			"scoop": "勺子(scoop)",
			"wok": "炒菜锅(wok)",
			"bread maker": "面包机(bread maker)",
			"knife set": "刀具套装(knife set)",
			"soup pot": "汤锅(soup pot)",
			"countertop": "台面(countertop)",
			"instant pot lid": "多合一锅盖(instant pot lid)",
			"yard waste bag": "庭院垃圾袋(yard waste bag)",
			"newspapers": "报纸(newspapers)",
			"blender": "搅拌机(blender)",
			"watermelon": "西瓜(watermelon)",
			"spoon": "勺子(spoon)",
			"notebook": "笔记本(notebook)",
			"lid": "盖(lid)",
			"induction cooker": "电磁炉(induction cooker)",
			"phone": "电话(phone)",
			"pattern": "图案(pattern)",
			"speakers": "扬声器(speakers)",
			"remote controller": "遥控器(remote controller)",
			"trash can lids": "垃圾桶盖(trash can lids)",
			"waste container": "垃圾容器(waste container)",
			"hand sanitizer stand": "洗手液架(hand sanitizer stand)",
			"roadblock": "路障(roadblock)",
			"isolation board": "隔离板(isolation board)",
			"plug panel": "插头面板(plug panel)",
			"sound": "音响(sound)",
			"cooktop": "炉灶(cooktop)",
			"baseboard heater": "踢脚板加热器(baseboard heater)",
			"coke box": "可乐盒(coke box)",
			"spatula": "刮刀(spatula)",
			"stock pot": "汤锅(stock pot)",
			"rigid duct": "刚性管道(rigid duct)",
			"wall calendar": "挂历(wall calendar)",
			"suspended ceiling": "吊顶(suspended ceiling)",
			"short wall": "短墙(short wall)",
			"hanger": "衣架(hanger)",
			"extinguisher": "灭火器(extinguisher)",
			"glove": "手套(glove)",
			"pan": "平底锅(pan)",
			"cleanser": "清洁剂(cleanser)",
			"laptop bag": "笔记本电脑包(laptop bag)",
			"paiting": "绘画(paiting)",
			"potted plants": "盆栽(potted plants)",
			"first aid": "急救箱(first aid)",
			"steamer pot": "蒸锅(steamer pot)",
			"power socket set": "电源插座组(power socket set)",
			"gas cooker": "煤气灶(gas cooker)",
			"kitchen tool holder": "厨房刀具架(kitchen tool holder)",
			"pressure cooker": "压力锅(pressure cooker)",
			"dishwashing liquid": "洗洁精(dishwashing liquid)",
			"water ladle": "浇水壶(water ladle)",
			"soy sauce bottle": "酱油瓶(soy sauce bottle)",
			"chair cushion": "椅垫(chair cushion)",
			"mop bucket": "拖把桶(mop bucket)",
			"bath brush": "沐浴刷(bath brush)",
			"shower enclosure": "淋浴间(shower enclosure)",
			"room divider": "房间隔断(room divider)",
			"cd tray": "CD 托盘(cd tray)",
			"wall board": "墙板(wall board)",
			"vegetable": "蔬菜(vegetable)",
			"sneakers": "运动鞋(sneakers)",
			"cabinet otherroom": "其他橱柜(cabinet otherroom)",
			"toilet tank": "马桶水箱(toilet tank)",
			"rocking": "摇摆(rocking)",
			"washbasin": "脸盆(washbasin)",
			"bath": "沐浴间(bath)",
			"washing": "洗涤物(washing)",
			"hand": "手(hand)",
			"meter": "仪表(meter)",
			"drying": "烘干(drying)",
			"beautician": "美容工具(beautician)",
			"hair": "头发(hair)",
			"handle": "手柄(handle)",
			"trashcan": "垃圾桶(trashcan)",
			"snowboard": "滑雪板(snowboard)",
			"vacuum": "真空吸尘器(vacuum)",
			"sack": "厚袋子(sack)",
			"item": "物品(item)",
			"water": "水(water)",
			"commode": "橱柜/马桶(commode)",
			"napkins": "餐巾(napkins)",
			"pet": "宠物(pet)",
			"bedside": "床边(bedside)",
			"dining": "餐桌旁(dining)",
			"barrel": "桶(barrel)",
			"garbage": "垃圾(garbage)",
			"newspaper": "报纸(newspaper)",
			"kitchen": "厨房(kitchen)",
			"cooking": "烹饪物(cooking)",
			"cutting": "剪裁物(cutting)",
			"kids": "孩子们(kids)",
			"ventilation": "通风(ventilation)",
			"items": "杂物(items)",
			"extractor": "排风扇(extractor)",
			"armor": "盔甲(armor)",
			"laundry": "洗衣物(laundry)",
			"hood": "兜帽(hood)",
			"coffee": "咖啡(coffee)",
			"side": "边(side)",
			"bbq": "烧烤架(bbq)",
			"flowers": "花朵(flowers)",
			"recycle": "回收物(recycle)",
			"barstool": "酒吧凳(barstool)",
			"pile": "桩(pile)",
			"roll": "卷(roll)",
			"computer": "电脑(computer)",
			"drawers": "抽屉(drawers)",
			"partition": "隔断(partition)",
			"candles": "蜡烛(candles)",
			"air": "空气(air)",
			"dumbbells": "哑铃(dumbbells)",
			"socket": "插座(socket)",
			"showcase": "展台(showcase)",
			"things": "杂物(things)",
			"file": "文件(file)",
			"device": "设备(device)",
			"tool": "工具(tool)",
			"plank": "板(plank)",
			"rolling": "滚轧(rolling)",
			"generator": "发电机(generator)",
			"figure": "雕塑(figure)",
			"plants": "植物(plants)",
			"sidetable": "边桌(sidetable)",
			"shelves": "架子(shelves)",
			"cupboard": "橱柜(cupboard)",
			"armoire": "大衣橱(armoire)",
			"sidecouch": "侧沙发(sidecouch)",
			"ironing": "熨烫衣物(ironing)",
			"puf": "杂物(puf)",
			"exit": "出口(exit)",
			"handhold": "扶手(handhold)",
			"upholstered": "软垫(upholstered)",
			"beanbag": "豆袋(beanbag)",
			"shades": "灯罩(shades)",
			"storage": "储物容器(storage)",
			"pack": "包(pack)",
			"documents": "文件(documents)",
			"sheets": "布料床单(sheets)",
			"notebooks": "笔记本(notebooks)",
			"beverage": "饮料(beverage)",
			"cut": "切(cut)",
			"slanted": "倾斜的(slanted)",
			"player": "播放机(player)",
			"jalousie": "百叶窗(jalousie)",
			"juicer": "榨汁机(juicer)",
			"chairs": "椅子(chairs)",
			"stuffed": "塞满物品(stuffed)",
			"balcony": "阳台(balcony)",
			"console": "控制台(console)",
			"office": "办公室(office)",
			"tennis": "网球(tennis)",
			"statuette": "小雕像(statuette)",
			"round": "圆形物体(round)",
			"t-shirt": "T恤(t-shirt)",
			"sauce": "酱(sauce)",
			"flush": "冲水(flush)",
			"fruit": "水果(fruit)",
			"cube": "立方体椅子(cube)",
			"folded": "折叠(folded)",
			"rolled": "卷(rolled)",
			"body": "物体(body)",
			"fence": "栅栏(fence)",
			"price": "价格(price)",
			"fruits": "水果(fruits)",
			"dishdrainer": "碗碟架(dishdrainer)",
			"food": "食物(food)",
			"milk": "牛奶(milk)",
			"dish": "盘子(dish)",
			"photos": "照片(photos)",
			"dress": "裙子(dress)",
			"salad": "沙拉(salad)",
			"spices": "调味瓶(spices)",
			"ramp": "坡道(ramp)",
			"utensils": "餐具(utensils)",
			"ventilator": "通气机(ventilator)",
			"puppet": "木偶(puppet)",
			"linen": "亚麻布(linen)",
			"foosball": "桌上足球(foosball)",
			"lockers": "储物柜(lockers)",
			"mandarins": "柑橘(mandarins)",
			"rubbish": "垃圾(rubbish)",
			"folding": "折叠物(folding)",
			"sideboard": "餐柜(sideboard)",
			"drum": "鼓(drum)",
			"discs": "光碟(discs)",
			"lounger": "躺椅(lounger)",
			"breadboard": "面包板(breadboard)",
			"tree": "树(tree)",
			"dog": "狗(dog)",
			"gymnastic": "体操(gymnastic)",
			"firewood": "柴(firewood)",
			"squeezer": "压榨机(squeezer)",
			"audio": "声音设备(audio)",
			"changing": "改变(changing)",
			"grass": "草(grass)",
			"exhaust": "排气管(exhaust)",
			"baby": "婴儿(baby)",
			"radio": "收音机(radio)",
			"dressing": "敷料(dressing)",
			"xbox": "Xbox(xbox)",
			"pavement": "路面(pavement)",
			"jug": "壶(jug)",
			"locker": "储物柜(locker)",
			"handbag": "手提包(handbag)",
			"brochure": "手册(brochure)",
			"drain": "排水管(drain)",
			"garden": "花园(garden)",
			"dishes": "盘碟(dishes)",
			"carriage": "滑动托架(carriage)",
			"stroller": "婴儿车(stroller)",
			"tile": "瓷砖(tile)",
			"cradle": "摇篮(cradle)",
			"mannequin": "模型(mannequin)",
			"darts": "飞镖(darts)",
			"multicooker": "多功能炊具(multicooker)",
			"apron": "围裙(apron)",
			"pocket": "口袋(pocket)",
			"loft": "阁楼(loft)",
			"fire": "灶火(fire)",
			"children's": "儿童物品(children's)",
			"cleaning": "清洁工具(cleaning)",
			"package": "包裹(package)",
			"weigths": "重物(weigths)",
			"cycling": "自行车(cycling)",
			"rowing": "划船(rowing)",
			"stereo": "立体声音响(stereo)",
			"roof": "屋顶(roof)",
			"elliptical": "椭圆形(elliptical)",
			"candlestick": "烛台(candlestick)",
			"bean": "豆(bean)",
			"medical": "医疗物品(medical)",
			"sewing": "缝纫衣物(sewing)",
			"bike": "自行车(bike)",
			"flipchart": "可移动白板(flipchart)",
			"buggy": "婴儿车(buggy)",
			"watering": "浇水管(watering)",
			"drinks": "饮料(drinks)",
			"corner": "角落(corner)",
			"teddy": "泰迪熊(teddy)",
			"fabric": "织物(fabric)",
			"ukulele": "尤克里里琴(ukulele)",
			"podest": "平台(podest)",
			"pin": "针状物(pin)",
			"hangers": "衣架(hangers)",
			"typewriter": "打字机(typewriter)",
			"spots": "灯光(spots)",
			"sugar": "糖(sugar)",
			"packs": "包(packs)",
			"diapers": "尿布(diapers)",
			"festoon": "彩灯(festoon)",
			"hygiene": "卫生(hygiene)",
			"child": "儿童用品(child)",
			"knife": "刀(knife)",
			"pepper": "胡椒(pepper)",
			"menu": "菜单(menu)",
			"weights": "重物(weights)",
			"tent": "帐篷(tent)",
			"cushions": "垫子(cushions)",
			"windows": "窗户(windows)",
			"letter": "字母图案(letter)",
			"instrument": "乐器(instrument)",
			"spice": "调料(spice)",
			"pooh": "杂物(pooh)",
			"aquarium": "鱼缸(aquarium)",
			"bulletin": "公告板(bulletin)",
			"bathroom": "浴室(bathroom)",
			"tv monitor": "电视显示器(tv monitor)",
			"washer": "垫片(washer)",
			"build in cabinet": "内置橱柜(build in cabinet)",
			"garbage bin": "垃圾桶(garbage bin)",
			"child chair": "儿童椅(child chair)",
			"bath cabinet": "浴室柜(bath cabinet)",
			"fruit plate": "果盘(fruit plate)",
			"kitchen sofa": "厨房沙发(kitchen sofa)",
			"kitchen appliance": "厨房用具(kitchen appliance)",
			"kitchen hood": "厨房油烟机(kitchen hood)",
			"hanging cabinet": "吊柜(hanging cabinet)",
			"shelf unit": "置物架(shelf unit)",
			"balcony door": "阳台门(balcony door)",
			"upholstered wall": "软垫墙(upholstered wall)",
			"dish dryer": "碗碟烘干机(dish dryer)",
			"glass wall": "玻璃墙(glass wall)",
			"wall other room": "其他房间墙壁(wall other room)",
			"floor other room": "其他房间地板(floor other room)",
			"kitchen towel": "厨房毛巾(kitchen towel)",
			"watering can": "喷壶(watering can)",
			"pile of books": "一叠书(pile of books)",
			"magazine files": "杂志收纳盒(magazine files)",
			"newspaper rack": "报刊架(newspaper rack)",
			"couch table": "沙发桌(couch table)",
			"shelf clutter": "架上杂物(shelf clutter)",
			"recycle bin": "回收站(recycle bin)",
			"sofa couch": "沙发(sofa couch)",
			"bedside table": "床头柜(bedside table)",
			"storage unit": "存储单元(storage unit)",
			"dining chair": "餐椅(dining chair)",
			"folding chair": "折叠椅(folding chair)",
			"shoe shelf": "鞋架(shoe shelf)",
			"pet bed": "宠物床(pet bed)",
			"medical device": "医疗设备(medical device)",
			"door other room": "其他房间的门(door other room)",
			"cleaning agent": "清洁剂(cleaning agent)",
			"wardrobe door": "衣柜门(wardrobe door)",
			"window frame": "窗框(window frame)",
			"pile of bottles": "一堆瓶子(pile of bottles)",
			"ceiling other room": "其他房间天花板(ceiling other room)",
			"oven glove": "烤箱手套(oven glove)",
			"exhaust hood": "抽油烟机(exhaust hood)",
			"knife box": "刀盒(knife box)",
			"drying machine": "烘干机(drying machine)",
			"hand washer": "洗手器(hand washer)",
			"cut board": "切菜板(cut board)",
			"tv table": "电视桌(tv table)",
			"bath counter": "浴室台面(bath counter)",
			"sugar packs": "糖袋(sugar packs)",
			"price tag": "价格标签(price tag)",
			"extractor fan": "抽气扇(extractor fan)",
			"dressing table": "梳妆台(dressing table)",
			"bar stool": "酒吧凳(bar stool)",
			"rolled carpet": "卷起的地毯(rolled carpet)",
			"tennis raquet": "网球拍(tennis raquet)",
			"pile of papers": "一堆文件(pile of papers)",
			"pile of folders": "一堆文件夹(pile of folders)",
			"desk chair": "办公桌椅(desk chair)",
			"curtain rail": "窗帘轨(curtain rail)",
			"stereo equipment": "立体声设备(stereo equipment)",
			"folded beach chairs": "折叠沙滩椅(folded beach chairs)",
			"shoe commode": "鞋柜(shoe commode)",
			"shower gel": "沐浴露(shower gel)",
			"body loofah": "身体沐浴球(body loofah)",
			"kitchen item": "厨房用品(kitchen item)",
			"baby seat": "婴儿座椅(baby seat)",
			"cleaning brush": "清洁刷(cleaning brush)",
			"washing powder": "洗衣粉(washing powder)",
			"towel basket": "毛巾篮(towel basket)",
			"baby changing table": "婴儿换尿布台(baby changing table)",
			"baby gym": "婴儿健身器(baby gym)",
			"beverage crate": "饮料箱(beverage crate)",
			"tool wall": "工具墙(tool wall)",
			"rolling cart": "滚动推车(rolling cart)",
			"office table": "办公桌(office table)",
			"window clutter": "窗户旁杂物(window clutter)",
			"paper stack": "纸叠(paper stack)",
			"wood box": "木盒(wood box)",
			"paper holder": "纸架(paper holder)",
			"washing basket": "洗衣篮(washing basket)",
			"seat pad": "座垫(seat pad)",
			"pin board wall": "钉板墙(pin board wall)",
			"bath robe": "浴袍(bath robe)",
			"floor mat": "地垫(floor mat)",
			"corner bench": "角落长凳(corner bench)",
			"window board": "窗板(window board)",
			"table soccer": "桌上足球(table soccer)",
			"baby bed": "婴儿床(baby bed)",
			"child clothes": "儿童衣物(child clothes)",
			"hygiene products": "卫生用品(hygiene products)",
			"paper sign": "纸标志(paper sign)",
			"baby toys": "婴儿玩具(baby toys)",
			"baby changing unit": "婴儿换尿布台(baby changing unit)",
			"rubbish bin": "垃圾桶(rubbish bin)",
			"drawers rack": "抽屉架(drawers rack)",
			"audio system": "音响系统(audio system)",
			"changing table": "换尿布台(changing table)",
			"pile of pillows": "一堆枕头(pile of pillows)",
			"bathroom items": "浴室用品(bathroom items)",
			"shelf of caps": "帽子架(shelf of caps)",
			"kids rocking chair": "儿童摇椅(kids rocking chair)",
			"bean bag": "豆袋(bean bag)",
			"firewood box": "柴火箱(firewood box)",
			"tree decoration": "树装饰(tree decoration)",
			"rolling pin": "擀面杖(rolling pin)",
			"slanted wall": "斜墙(slanted wall)",
			"wall plants": "墙壁植物(wall plants)",
			"children's table": "儿童桌(children's table)",
			"sink counter": "水槽台面(sink counter)",
			"tissue pack": "纸巾包(tissue pack)",
			"kids table": "儿童桌(kids table)",
			"kids chair": "儿童椅(kids chair)",
			"wall rack": "壁架(wall rack)",
			"photo frame": "相框(photo frame)",
			"kitchen rack": "厨房架(kitchen rack)",
			"gymnastic ball": "瑜伽球(gymnastic ball)",
			"doorframe other room": "其他房间门框(doorframe other room)",
			"kids stool": "儿童凳(kids stool)",
			"toy house": "玩具屋(toy house)",
			"kitchen playset": "厨房玩具套装(kitchen playset)",
			"hand brush": "手刷(hand brush)",
			"bath rack": "浴室架(bath rack)",
			"bed table": "床头柜(bed table)",
			"clothes rack": "衣架(clothes rack)",
			"kitchen object": "厨房用品(kitchen object)",
			"door mat": "门垫(door mat)",
			"dining set": "餐具(dining set)",
			"pile of candles": "一堆蜡烛(pile of candles)",
			"kids bicycle": "儿童自行车(kids bicycle)",
			"elliptical trainer": "椭圆机(elliptical trainer)",
			"rowing machine": "划船机(rowing machine)",
			"cycling trainer": "骑行训练器(cycling trainer)",
			"sauce boat": "酱汁船(sauce boat)",
			"cable rack": "电缆架(cable rack)",
			"cushions stack": "堆叠的垫子(cushions stack)",
			"pile of wires": "一堆电线(pile of wires)",
			"magazine stand": "杂志架(magazine stand)",
			"kitchen sink": "厨房水槽(kitchen sink)",
			"drain pipe": "排水管(drain pipe)",
			"garden umbrella": "庭院伞(garden umbrella)"
		}


	}

	//////////////////////// stage 1: s only
	//////////////////////////


	//////////////////////// stage 1.1: activity-based situation filling

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


	//////////////////////// stage 2: qa only
	
	//////////////////////////

	//////////////////////// stage 3: human study

	/////////////////////////////////////

	//////////////////////// stage 3.1: human study (bundled)

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
		//For Chinese Version
		if (this.intersected_name in this.obj_name_translation){
			this.canvas_label.innerHTML = this.obj_name_translation[this.intersected_name];
		}
		//For English Version
		//this.canvas_label.innerHTML = this.intersected_name;
		document.getElementById("id_div_root").appendChild(this.canvas_label);
	}

	render_label_list() {
		// add instances
		// console.log(this.datasettype)
		//console.log(this.scenegraph)
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

			if (this.resources.datasetname == 'scannet'){
				//console.log(this.resources.scene_object_id[i])
				this.all_object_info = this.scenegraph['objects_info']
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

			} else if (this.resources.datasetname == 'multiscan' || this.resources.datasetname == 'arkitscene_train' || this.resources.datasetname == 'arkitscene_valid'){
				//console.log(this.resources.scene_object_id[i])
				this.all_object_info = this.scenegraph['objects_info']
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

			} else if (this.resources.datasetname == '3RScan'){
				//console.log(this.resources.scene_object_id[i])
				this.all_object_info = this.scenegraph['objects_info']
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

			//For Chinese Version
			// var ret = utils.add_instance_label_no_color(document, this.label_container, this.resources.palette, this.object_dict[object_id].chinese_name.toString(), new_list_tmp_obj, list_tmp[i][1].length, new_list_tmp_obj_size);
			//For English Version
			var ret = utils.add_instance_label_no_color(document, this.label_container, this.resources.palette, this.object_dict[object_id].name.toString(), new_list_tmp_obj, list_tmp[i][1].length, new_list_tmp_obj_size);
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
		//this.resources.referring_expressions_id = params.referring_expressions_id
		this.resources.scene_object = params.scene_object;
		//console.log("this.resources.scene_object", this.resources.scene_object)
		this.resources.scene_object_id = this.get_scene_object_id();
		this.resources.scene_object_name = this.get_scene_object_name();
		this.resources.scene_object_dict = this.get_scene_object_dict();
		this.resources.scene_mesh = this.resources.scene_id + "_vh_clean_2.ply";
		//this.resources.scenegraph = "objects.json"
		//this.resources.datasettype = 'type.json'
		//this.resources.referring_expressions = "referring_expressions.json"
		this.resources.ref_exp_graphs = "ref_exp_graphs.json"
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
			//console.log("this.resources.scene_object[i]", this.resources.scene_object[i])
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
			//console.log("scene children", this.scene.children)
			//console.log("this.raycaster", this.raycaster)
			let intersected = this.raycaster.intersectObjects(this.scene.children.slice(5));
			//console.log("intersected", intersected)
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
					//Next line has wrong implementation
					//this.intersected_chinese_name = this.intersected[0].chinese_name;
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
		if (this.resources.datasetname == 'scannet'){
			return mesh
		}else{
			//mesh.position.x -= this.scene_geometry_center.x; //问题在于这个center不是平均值，而是bounding sphere球体的中心坐标
			//mesh.position.y -= this.scene_geometry_center.y;
			return mesh
		}
		//mesh.position.x -= this.scene_geometry_center.x;
		//mesh.position.y -= this.scene_geometry_center.y;
		//var minz = this.scene_geometry.boundingBox.min.z
		//console.log("hahahah", this.scene_geometry.boundingBox.min.z)
		//if (this.resources.datasetname != 'scannet'){
		//	mesh.position.z -= this.scene_geometry_min_z
		//	
		//}
		//mesh.position.z = -this.scene_geometry_center.z;

		//return mesh
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
			// this.all_object_info = this.scenegraph['objects_info']//[this.selected_id - 1]
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
