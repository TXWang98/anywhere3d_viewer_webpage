import React from 'react';
import ReactDOM, { render } from 'react-dom';
import RootUI from './view/RootUI';


class Tutorial {

    init(params) {
        this.draw_div();

        // setup button

        // this.btn = new Object();
        // this.btn.next = document.getElementById("btn_next");
        // this.btn.prev = document.getElementById("btn_prev");
        // this.add_listener(this.btn.next, "click", this.on_click_btn_next);
        // this.add_listener(this.btn.prev, "click", this.on_click_btn_prev);

        this.container = document.getElementById("tutorial_container");

        this.task_type = params.task_type;
        this.current_page = 1;
        if (this.task_type == 1) {
            this.total_pages = 5;
            this.tutorial = new SOnlyTutorial(this.container);
            this.tutorial["render_page_" + this.current_page]();
        }
        else if (this.task_type == 2) {
            this.total_pages = 5;
            this.tutorial = new QAOnlyTutorial(this.container);
            this.tutorial["render_page_" + this.current_page]();
        }
        else if (this.task_type == 3) {
            this.total_pages = 4;
            this.tutorial = new AOnlyTutorial(this.container);
            this.tutorial["render_page_" + this.current_page]();
        }
        else if (this.task_type == 4) {
            this.total_pages = 4;
            this.tutorial = new SOnlyNoSelectTutorial(this.container);
            this.tutorial["render_page_" + this.current_page]();
        }
        else if (this.task_type == 5) { // same as task_type==3
            this.total_pages = 4;
            this.tutorial = new AOnlyTutorial(this.container);
            this.tutorial["render_page_" + this.current_page]();
        }
        else {
            this.total_pages = 5;
            this.tutorial = new GenericTutorial(this.container);
            this.tutorial["render_page_" + this.current_page]();
        }
    }

    clear_page() {
        document.getElementById("tutorial_container").replaceChildren();
    }

    /********************************************
     *************  Event handlers  *************
     ********************************************/



    // on_click_btn_prev() {
    //     if (this.current_page != 1) {
    //         this.current_page -= 1;
    //         this.clear_page();
    //         this.tutorial["render_page_" + this.current_page]();
    //     }
    // }

    // on_click_btn_next() {
    //     if (this.current_page != this.total_pages) {
    //         this.current_page += 1;
    //         this.clear_page();
    //         this.tutorial["render_page_" + this.current_page]();
    //     }
    // }

    draw_div() {
        ReactDOM.render(<RootUI />, document.getElementById('id_div_root'));
    }

    add_listener(element, event, callback, argument = null) {
        this[callback.name + "_ref"] = callback.bind(this);
        if (argument) {
            element.addEventListener(event, this[callback.name + "_ref"](argument));
        }
        else {
            element.addEventListener(event, this[callback.name + "_ref"]);
        }
    }

}

window.Tutorial = Tutorial;


class GenericTutorial {

    constructor(container) {
        this.container = container;
    }

    render_page_1() {
        this.insert_page_title("Anywhere3D Human Annotation Tutorial");
        this.insert_one_text_entry("The human annotation interface comprises four main components: a control bar, a 3D scene visualization module, an object list, and a referring expression editing box.<br> Here we present 4 scene selected from 4 datasets: https://anywhere3d-viewer-webpage.onrender.com/apps/meshviewer/datasetname=arkitscene_valid&scene_id=scene0004_00,<br> https://anywhere3d-viewer-webpage.onrender.com/apps/meshviewer/datasetname=scanet&scene_id=scene0046_00,<br> https://anywhere3d-viewer-webpage.onrender.com/apps/meshviewer/datasetname=3RScan&scene_id=scene0992_00,<br> https://anywhere3d-viewer-webpage.onrender.com/apps/meshviewer/datasetname=multiscan&scene_id=scene0109_00.<br>The original scene names and datasetnames are as follows: ScanNet scene0046_00, ARKitScenes Validation 47115473, 3RScan 38770cb0-86d7-27b8-8466-1782505891fd, MultiScan scene_00109_00.");

        this.insert_one_text_entry("<b>1. Control Bar</b>: includes three primary tools:<br>(1) a 3D bounding box annotation tool<br>(2) a distance measurement tool (i.e. Scale Cylinder)<br>(3) a coordinate axis visualization tool<br>Both the bounding box and distance measurement cylinder can be resized and repositioned using the control bar. Their positions can also be interactively adjusted with the mouse.<br><b style=\"color:red;\">W</b>, <b style=\"color:green;\">L</b>, and <b style=\"color:blue;\">H</b> represent the lengths of the bounding box along the x-, y-, and z-axes, respectively.<br><b style=\"color:red;\">X</b>, <b style=\"color:green;\">Y</b>, and <b style=\"color:blue;\">Z</b> represent the relative positions of the bounding box and cylinder on x-, y-, z- axes, respectively. The progress bar will reset (return to the middle position) after dragging the mouse to move the bounding box or cylinder.<br>Clicking the 'Reset' button will restore both the size and position of the corresponding bounding box or cylinder to their initial values.");
        this.insert_one_image_entry("/apps/resource/tutorial/control_bar.png", "500px", "700px");

        this.insert_one_text_entry("<b>2. Scene Visualization</b>: Scrolling the mouse wheel allows you to zoom in and out of the scene.<br>Pressing down the mouse wheel while dragging enables you to pan the scene.<br>Placing the left mouse button over an object will highlight its corresponding point cloud.<br>Pressing down the right mouse button and dragging allows you to rotate the scene.");
        this.insert_one_image_entry("/apps/resource/tutorial/scene_visualization.png", "920px", "500px");

        this.insert_one_text_entry("<b>3. Object List</b>: The object list displays all objects in the scene, along with their associated labels and sizes(length along x-axes, y-axes and z-axes)");
        this.insert_one_image_entry("/apps/resource/tutorial/object_list.png", "400px", "800px");

       
        this.insert_one_text_entry("<b>4. Referring Expression Editing Box</b>: For each scene, there are 10 interactive slots for human annotation, labeled from '00' to '09'. To begin, click on the ID you wish to annotate. After clicking the corresponding ID, a message will appear below indicating whether the selected ID already has existing annotations. You may then choose to start a new annotation or load a saved one if it exists. The interactive slot allows you to manually revise the referring expressions. After completing the bounding box, cylinder, and referring expression annotations, click 'Save Current ID Annotations' to save your work.");
        this.insert_one_image_entry("/apps/resource/tutorial/expression_editing_box.png", "1500px", "200px");  
    }

    // render_page_2() {
    //     this.insert_page_title("About step 1: Exploring the scene");
    //     this.insert_one_image_entry_with_title_description("Rotate", "<span style=\"color: red;\">Right click</span> and drag the scene to rotate", "/apps/resource/tutorial/rotate.gif");
    //     this.insert_one_image_entry_with_title_description("Move", "<span style=\"color: red;\">Middle click</span> and drag the scene to move", "/apps/resource/tutorial/move.gif");
    //     this.insert_one_image_entry_with_title_description("Zoom", "Hover the mouse on the scene and <span style=\"color: red;\">scroll the wheel</span> to zoom", "/apps/resource/tutorial/zoom.gif");
    // }

    // render_page_3() {
    //     this.insert_page_title("About step 1(cont'd): Exploring objects in the scene");
    //     this.insert_one_image_entry_with_title_description("Click an object in the scene", "<span style=\"color: red;\">Hover on and left click</span> an object in the scene for its name", "/apps/resource/tutorial/object_click.gif");
    //     this.insert_one_image_entry_with_title_description("Highlight a group of objects", "<span style=\"color: red;\">Hover on</span> the object group in the list to hightlight their member objects", "/apps/resource/tutorial/object_group.gif");
    //     this.insert_one_image_entry_with_title_description("Highlight an object instance", "<span style=\"color: red;\">Click</span> the object group to unfold the list and <span style=\"color: red;\">hover on</span> an item to highlight an object instance", "/apps/resource/tutorial/object_item.gif");
    // }

    // render_page_4() {
    //     this.insert_page_title("About step 2: Moving the green arrow");
    //     this.insert_one_image_entry_with_title_description("Move", "<span style=\"color: red;\">Click and drag</span> the arrow to move", "/apps/resource/tutorial/arrow_move.gif");
    //     this.insert_one_image_entry_with_title_description("Rotate", "<span style=\"color: red;\">Ctrl+Shift+← or →</span> to rotate", "/apps/resource/tutorial/arrow_rotate.gif");
    // }


    // <span style=\"color: red\">×</span>
    // <span style=\"color: green\">√</span>

    // render_page_5() {
    //     this.insert_page_title("About step 3: How to describe a location and orientation (a.k.a. \"context\")?");

    //     this.insert_rejection_alert("Ambiguous or wrong description will be rejected.")
    //     this.insert_one_text_entry("You may use one or more objects to help determine a unique location and orientation. More reference objects can help eliminate the ambiguity.");
    //     this.insert_one_image_entry_with_description("<b>I'm facing the front door <span style=\"color: red\">×</span></b> -- this is also valid for locations that are further from the door<br> <b>I'm facing the door and there are some trash cans on my left <span style=\"color: green\">√</span></b> <br> <b>I'm standing in front of the door and there is cabinet on my right <span style=\"color: green\">√</span></b>", "/apps/resource/tutorial/desc_example_1.png", "880px", "550px");
    //     this.insert_one_image_entry_with_description("<b>I'm sitting on the toilet <span style=\"color: red\">×</span></b> -- there are more than one toilet in the scene<br> <b>I'm sitting on the toilet and there is a toilet paper holder on my right <span style=\"color: green\">√</span></b> <br> <b>I'm sitting on the toilet and there is a door on my left <span style=\"color: green\">√</span></b>", "/apps/resource/tutorial/desc_example_2.png", "920px", "550px");
    //     this.insert_one_image_entry_with_description("<b>I'm standing on a rug <span style=\"color: red\">×</span></b> -- there are more than one rug in the scene and the orientation is unclear <br> <b>I'm standing on a rug, facing a sink and there is a door in my four o'clock direction <span style=\"color: green\">√</span></b> <br> <b>I'm standing on a rug, facing a sink and there is a trash can on my left <span style=\"color: green\">√</span> </b>", "/apps/resource/tutorial/desc_example_3.png", "920px", "550px");

    //     this.insert_bonus_reminder("Descriptions using common human activities on objects will be rewarded.");
    //     this.insert_one_image_entry_with_description("<b>I'm heating my lunch and there is a fridge on my right <span style=\"color: green\">√</span></b> -- we use a microwave to heat the food", "/apps/resource/tutorial/desc_example_4.png", "920px", "500px");

    //     this.insert_one_image_entry_with_description("<b>I'm brushing my teeth and there is a toilet on my right <span style=\"color: green\">√</span></b> -- we use a sink in the restroom to brush our teeth", "/apps/resource/tutorial/desc_example_5.png", "920px", "500px");

    //     this.insert_one_image_entry_with_description("<b>I'm scanning some paperwork and there is a printer on my left <span style=\"color: green\">√</span></b> -- we use a copier to scan some files", "/apps/resource/tutorial/desc_example_6.png", "920px", "500px");
    // }

    // render_page_6() {
    //     this.insert_page_title("About step 4: How to ask a question -- general guidance");

    //     this.insert_rejection_alert("Questions that can be answered without considering the context (determined by the picked location and orientatoion) will be rejected.");
    //     this.insert_one_image_entry_with_description("<b>Context</b>: I'm sitting on the chair and using my laptaop  <br> <b>How many toilets are there in the room? <span style=\"color: red\">×</span></b><br> <b>What is color of the blanket on the bed? <span style=\"color: red\">×</span></b> <br> <b>Is there a laptop on the desk? <span style=\"color: red\">×</span></b><br><b> Is there a TV behind me? <span style=\"color: green\">√</span></b><br><b> How many backpacks are there on my left? <span style=\"color: green\">√</span></b><br><b> Which direction should I go If I want to leave the room? <span style=\"color: green\">√</span></b>", "/apps/resource/tutorial/q_example_1.png", "920px", "500px");

    //     this.insert_one_image_entry_with_description("<b>Context</b>: I'm watering the plant and standing by a round table <br> <b>How many armchairs are there in the room? <span style=\"color: red\">×</span></b><br> <b>How many armchairs are there on my left? <span style=\"color: green\">√</span></b><br> <b>What is the color of the armchair in my 11 o'clock direction, blue or brown? <span style=\"color: green\">√</span></b><br> <b>Is it true the armchairs behind me are arranged in a straight line? <span style=\"color: green\">√</span></b><br>", "/apps/resource/tutorial/q_example_2.png", "920px", "500px");

    //     this.insert_one_image_entry_with_description("<b>Context</b>: I'm sitting on the couch in between two pillows, and the TV and an ottoman are both in front of me <br> <b> Is there a glass table in the room? <span style=\"color: red\">×</span></b><br> <b>Which is larger, the golden table or the glass table? <span style=\"color: red\">×</span></b><br> <b> How many ottomans are there in the room? <span style=\"color: red\">×</span></b><br> <b>How many stools are there on my left? <span style=\"color: green\">√</span></b><br> <b>What is the color of the pillow in my 2 o'clock direction? <span style=\"color: green\">√</span></b><br>", "/apps/resource/tutorial/q_example_3.png", "920px", "500px");
    // }

    // render_page_7() {
    //     this.insert_page_title("About step 4(cont'd): How to ask a question -- free-form question");

    //     this.insert_one_text_entry("You may ask questions about object <b>category</b>");
    //     this.insert_one_image_entry_with_description("<b>Context</b>: I'm facing the sink and there is a towel on my right. <br> <b>What is standing on the floor on my left? -- trash can</b> <br><b>Is there a towel on my right? -- yes</b> <br><b>What is in my 4 o'clock direction? -- door</b>", "/apps/resource/tutorial/desc_example_3.png", "920px", "550px")

    //     this.insert_one_text_entry("You may ask questions about <b>counting</b>");
    //     this.insert_one_image_entry_with_description("<b>Context</b>: I'm sitting on the couch in between two pillows, and the TV and an ottoman are both in front of me <br><b>How many pillowss are there on my right? -- three</b> <br><b>Are there two glass tables in front of me? -- no</b>", "/apps/resource/tutorial/q_example_3.png", "920px", "500px");

    //     this.insert_one_text_entry("You may ask questions about object <b>properties</b> (color, shape, pose, containing, etc)");
    //     this.insert_one_image_entry_with_description("<b>Context</b>: I'm sitting on an armchair, facing a green ottoman and there is a opened door behind me <br><b> What is the color of the cabinet behind me? -- pink</b> <br><b>Does the ottoman in front of me have a round shape? -- no</b> <br><b>Is the door in my 4 o'clock direction opened? -- no</b> <br><b>How many pillowss are there on the couch on my right? -- two</b>", "/apps/resource/tutorial/q_example_4.png", "920px", "800px");

    //     this.insert_one_text_entry("You may ask questions about <b>spatial relations and layouts</b>");
    //     this.insert_one_image_entry_with_description("<b>Context</b>: I'm playing ping-pong where there is a rug in my 8 o'clock direction <br><b>Which one is closer to me, an armchair or a door? -- armchair</b> <br><b>How many couches can I see? -- two</b> <br><b>Which direction should I go if I want to go upstairs? -- left</b> <br><b>Is there a door on my left? -- yes</b> <br><b>Can I see any trashcan? -- no</b> <br><b>What will I end up with if I keep walking left? -- door</b> <br><b>Can I open any door without moving? -- no</b>", "/apps/resource/tutorial/q_example_5.png", "920px", "800px");
    // }

    // page 8 is about commonsense question

    // page 9 is about nav question

    ////////////////////////////////////////////////
    // Helper functions
    ////////////////////////////////////////////////

    insert_page_title(page_title) {
        let title_e = document.createElement("h1");
        title_e.innerHTML = page_title + "<hr/>";
        this.container.appendChild(title_e);

    }

    insert_one_text_entry(text, font='21px') {
        let text_e = document.createElement("label");
        text_e.style = "font-size:"+font;
        text_e.innerHTML = text;
        this.container.appendChild(text_e);
        this.container.appendChild(document.createElement("br"));
    }

    insert_rejection_alert(text) {
        let text_e = document.createElement("label");
        text_e.style = "font-size: 21px";
        text_e.innerHTML = "<span style=\"color: red; font-size: 30px;\"><b>Rejection alert:</b></span> <b>" + text + "</b>";
        this.container.appendChild(text_e);
        this.container.appendChild(document.createElement("br"));
    }

    insert_bonus_reminder(text) {
        let text_e = document.createElement("label");
        text_e.style = "font-size: 21px";
        text_e.innerHTML = "<span style=\"color: green; font-size: 30px;\"><b>Bonus reminder:</b></span> <b>" + text + "</b>";
        this.container.appendChild(text_e);
        this.container.appendChild(document.createElement("br"));
    }

    insert_one_text_entry_with_title(title, text) {
        let title_e = document.createElement("h3");
        title_e.innerHTML = title;
        this.container.appendChild(title_e);

        let text_e = document.createElement("label");
        text_e.style = "font-size: 21px";
        text_e.innerHTML = text;
        this.container.appendChild(text_e);
        this.container.appendChild(document.createElement("br"));
    }

    insert_one_image_entry(image_url, width, height) {
        let image_e = document.createElement("img");
        image_e.src = image_url;
        console.log(width, height);
        if (width) {
            image_e.style.width = width;
        } else {
            image_e.style.width =  "920px";
        }
        if (height) {
            image_e.style.height = height;
        } else {
            image_e.style.height = "383px";
        }
        let center_e = document.createElement("center");
        center_e.appendChild(image_e);
        this.container.appendChild(center_e);
        this.container.appendChild(document.createElement("br"));
    }

    insert_one_image_entry_with_description(text, image_url, width, height) {
        let image_e = document.createElement("img");
        image_e.src = image_url;
        if (width) {
            image_e.style.width = width;
        } else {
            image_e.style.width = "920px";
        }
        if (height) {
            image_e.style.height = height;
        } else {
            image_e.style.height = "383px";
        }
        let center_e = document.createElement("center");
        center_e.appendChild(image_e);
        this.container.appendChild(center_e);
        this.container.appendChild(document.createElement("br"));

        let text_e = document.createElement("label");
        text_e.style = "font-size: 21px";
        text_e.innerHTML = text;
        center_e = document.createElement("center");
        center_e.appendChild(text_e);
        this.container.appendChild(center_e);
    }

    insert_one_image_entry_with_title_description(title, text, image_url, width, height) {
        let title_e = document.createElement("h3");
        title_e.innerHTML = title;
        this.container.appendChild(title_e);

        let image_e = document.createElement("img");
        image_e.src = image_url;
        if (width) {
            image_e.style.width = width;
        } else {
            image_e.style.width = "920px";
        }
        if (height) {
            image_e.style.height = height;
        } else {
            image_e.style.height = "383px";
        }
        let center_e = document.createElement("center");
        center_e.appendChild(image_e);
        this.container.appendChild(center_e);
        this.container.appendChild(document.createElement("br"));

        let text_e = document.createElement("label");
        text_e.style = "font-size: 21px";
        text_e.innerHTML = "<b>" + text + "</b>";
        center_e = document.createElement("center");
        center_e.appendChild(text_e);
        this.container.appendChild(center_e);
    }
}


class SOnlyTutorial extends GenericTutorial {

    render_page_1() {
        this.insert_page_title("Task overview");
        this.insert_one_text_entry("In this task, you need to complete the following steps:");

        this.insert_one_text_entry("<b>Step 1</b>: Explore a 3D scene. Try to get familiar with the <b>layout and objects</b> inside. You may refer to following tutorial pages on how to explore the scene.");
        this.insert_one_image_entry("/apps/resource/tutorial/explore_scene.gif");

        this.insert_one_text_entry("<b>Step 2</b>: Pick a certain <b>location and orientation</b> (we name them <b>\"context\"</b>) in the scene and navigate the <b style=\"color:green;\">green arrow</b> to the picked location and orientation.");
        this.insert_one_image_entry("/apps/resource/tutorial/pick_arrow.gif");

        this.insert_one_text_entry("<b>Step 3</b>: Describe the <b>\"context\"</b> picked in <b>Step 2</b> with a sentence. The description <b>cannot be ambiguous</b> -- it should locate a <b>unique</b> context picked by you.");
        this.insert_one_text_entry("ex. I'm standing by the table, where there is a chair on my right and a few more behind me.")

        this.insert_rejection_alert("If the descrption is ambiguous or does not match the picked location&orientation, it will be rejected. More on ambiguity will come later in this tutorial.");
    }
}


class QAOnlyTutorial extends GenericTutorial {
    render_page_1() {
        this.insert_page_title("Task overview");
        this.insert_one_text_entry("In this task, you need to complete the following steps:");

        this.insert_one_text_entry("<b>Step 1</b>: Explore a 3D scene. Try to get familiar with the <b>layout and objects</b> inside. You may refer to following tutorial pages on how to explore the scene.");
        this.insert_one_image_entry("/apps/resource/tutorial/explore_scene_new.gif");

        this.insert_one_text_entry("<b>Step 2</b>: Given a <b>location and orientation</b> (depicted by a <b style=\"color:green;\">green arrow</b>) in the scene and its description (we name them <b>\"context\"</b>), ask some questions about the 3D scene and answer them.");
        this.insert_one_text_entry("ex.");
        this.insert_one_text_entry("<b>Description</b>: I'm sitting on the chair, facing three monitors.");
        this.insert_one_text_entry('<b>Question</b>: Which direction should I go if I want to leave the room?');
        this.insert_one_text_entry('<b>Answer</b>: right');

        this.insert_rejection_alert("Assignment with questions that can be answered without considering the context will be rejected. More on this will come later in this tutorial.");
        this.insert_rejection_alert("Questions that can be answered by merely reading the description (no need to review the 3D scene) will be rejected. More on this will come later in this tutorial.");
        this.insert_rejection_alert('You may ask at most 3 "simple" questions (you need to ask 5 questions in total) as we encourage creative questions. More on this will come later in this tutorial.');
    }

    render_page_4() {
        this.insert_page_title("About step 2: How to ask a question -- general guidance");

        this.insert_rejection_alert("Assignment with questions that can be answered without considering the context will be rejected.");
        this.insert_rejection_alert("Questions that can be answered by merely reading the description (no need to review the 3D scene) will be rejected.");
        this.insert_one_image_entry_with_description(`
        <b>Description</b>: <p style="font-size: 25px; border:3px; border-style:solid; border-color:#A2DAFF; padding: 0.3em;">I'm sitting on the chair and using my laptop </p>
        <b>How many toilets are there in the room? <span style=\"color: red\">×</span></b><br>
        <b>What is the color of the blanket on the bed? <span style=\"color: red\">×</span></b> <br>
        <b>What am I sitting on? <span style=\"color: red\">×</span></b> <br>
        <b>Is there a laptop around me? <span style=\"color: red\">×</span></b><br>
        <b> Which direction should I go If I want to leave the room? <span style=\"color: green\">√</span></b><br>
        <b> Can I see the TV in the room? <span style=\"color: green\">√</span></b><br>
        <b> Am I in the bathroom? <span style=\"color: green\">√</span></b><br>
        `, "/apps/resource/tutorial/q_example_1.png", "920px", "500px");

        // this.insert_one_image_entry_with_description(`
        // <b>Description</b>: <p style="font-size: 25px; border:3px; border-style:solid; border-color:#A2DAFF; padding: 0.3em;">I'm watering the plant and standing by a round table</p>
        // <b>How many armchairs are there in the room? <span style=\"color: red\">×</span></b><br>
        // <b>What am I standing by? <span style=\"color: red\">×</span></b><br>
        // <b>What is the shape of the table I'm standing by? <span style=\"color: red\">×</span></b><br>
        // <b>How many armchairs are there on my left? <span style=\"color: green\">√</span></b><br>
        // <b>What is the color of the armchair in my 11 o'clock direction, blue or brown? <span style=\"color: green\">√</span></b><br>
        // <b>Is it true the armchairs behind me are arranged in a straight line? <span style=\"color: green\">√</span></b><br>`, "/apps/resource/tutorial/q_example_2.png", "920px", "500px");

        this.insert_one_image_entry_with_description(`
        <b>Description</b>: <p style="font-size: 25px; border:3px; border-style:solid; border-color:#A2DAFF; padding: 0.3em;">I'm sitting on the couch in between two pillows, and the TV and an ottoman are both in front of me </p>
        <b>Which is larger, the golden table or the glass table? <span style=\"color: red\">×</span></b><br> <b> How many ottomans are there in the room? <span style=\"color: red\">×</span></b><br>
        <b> Is there any pillow around me? <span style=\"color: red\">×</span></b><br>
        <b> Is there a TV in front of me? <span style=\"color: red\">×</span></b><br>
        <b>Does the table in front of me has the same shape as a steering wheel? <span style=\"color: green\">√</span></b><br>
        <b>Which one is closer to me, the table or the TV? <span style=\"color: green\">√</span></b><br>
        <b>Is there a clock hanging on the wall in front of me? <span style=\"color: green\">√</span></b><br>`, "/apps/resource/tutorial/q_example_3.png", "920px", "500px");
    }

    render_page_5() {
        this.insert_page_title("About step 2(cont'd): How to ask a question -- creative question");

        this.insert_bonus_reminder('Assignment with more creative questions will be rewarded.');
        this.insert_rejection_alert('You may ask at most 3 "simple" questions (you need to ask 5 questions in total) as we encourage creative questions. The following are viewed as "simple" questions:');
        this.insert_one_text_entry('- Questions about simple object category/property or counting, ex. Is there a chair in my 6 o\'clock direction?; What is the color of the table on my right?; How many chairs are there behind me?');
        this.insert_one_text_entry('- Questions that repeat the same pattern');
        this.insert_one_text_entry('- Questions that can be answered with "yes" or "no" (Note: some creative questions can also have answer "yes" or "no", but you still need to control the overall amount of questions with answer "yes" or "no" in your assignment)');
        this.insert_page_title('');

        this.insert_one_text_entry("<b>Example of creative questions:</b>", '28px');

        this.insert_one_text_entry("", '28px');

        this.insert_one_text_entry("We encourage <b>\"embodied\"</b> questions -- just imagine you're there, What do you see? What can you do?", '28px');
        this.insert_one_image_entry_with_description(`
        <b>Description</b>: <p style="font-size: 25px; border:3px; border-style:solid; border-color:#A2DAFF; padding: 0.3em;">I'm washing my face in front of the bathroom vanity. </p>
        <b>Can I see myself in the mirror? -- yes</b> <br>
        <b>Can I reach the plant in the room without moving? -- no</b> <br>
        <b>Which one is closer to me, the towel or the bathtub? -- towel</b> <br>
        <b>Which direction should I go if I want to leave the room? -- right</b><br>
        <b>Can I still walk forward? -- no</b><br>
        <b>How many sinks can I see? -- one</b><br>
        `, "/apps/resource/tutorial/desc_example_3.png", "920px", "550px");
        this.insert_page_title('');

        this.insert_one_text_entry("We encourage questions that requires <b>common sense knowledge</b> -- try to think out of the box", '28px');
        this.insert_one_image_entry_with_description(`
        <b>Description</b>: <p style="font-size: 25px; border:3px; border-style:solid; border-color:#A2DAFF; padding: 0.3em;">I'm
        playing ping-pong where there is a rug in my 8 o'clock direction </p>
        <b>Gotta dispose a soda can I just finished, which direction should I go?  -- backwards</b> <br>
        <b>Which object behind me needs to be taken care of when it's raining? -- window</b> <br>
        <b>Is the amount of chairs on my right odd or even?  -- even</b> <br>
        <b>Can I get a cold drink without moving that much? -- no</b> <br>
        <b>Does the ping-pong table in front of me has the same color as an eggplant? -- yes</b> <br>
        `, "/apps/resource/tutorial/q_example_5.png", "920px", "800px");
        this.insert_page_title('');

        this.insert_one_text_entry("We encourage questions that require <b>\"multi-hop\"</b> thinking -- you shouldn't just think straight!", '28px');
        this.insert_one_image_entry_with_description(`
        <b>Description</b>: <p style="font-size: 25px; border:3px; border-style:solid; border-color:#A2DAFF; padding: 0.3em;">I'm sitting on the couch in between two pillows, and the TV and an ottoman are both in front of me </p>
        <b>How many ottomans can I see if I turn my head backwards?  -- zero</b><br>
        <b>What is to the right of the table in front of me? -- ottoman</b><br>
        <b>How many chairs are under the table on my left? -- four</b><br>
        <b>Is there a clock hanging on the wall in front of me?  -- no</b><br>
        <b>Which one is closer to the table in front of me, a chair or a couch? -- couch</b><br>
        `, "/apps/resource/tutorial/q_example_3.png", "920px", "500px");
        this.insert_page_title('');

        this.insert_one_text_entry("We encourage questions about <b>interesting</b> object <b>properties</b> (state, shape, size, etc)", '28px');
        this.insert_one_image_entry_with_description(`
        <b>Description</b>: <p style="font-size: 25px; border:3px; border-style:solid; border-color:#A2DAFF; padding: 0.3em;">I'm sitting on an armchair, facing a green ottoman and there is a opened door behind me </p>
        <b>Is the chair I sit on and the ottoman in front of me made by the same material? -- no</b> <br>
        <b>Is the door in my 4 o'clock direction opened or closed? -- closed</b> <br>
        <b>Is the window on my left covered by curtain? -- no</b><br>
        <b>How many cushions are there on the couch to my right? -- one</b><br>
        <b>Is the desk in front of you messy or tidy? -- messy</b><br>
        <b>Is the light over my head on or off? -- off</b><br>
        <b>Does the ottoman in front of me have a round shape? -- no</b> <br>
        <b>Is the chair I sit on hard? -- yes</b><br>
        <b>Which one is bigger, the chair I sit on or the ottoman in front of me? -- ottoman</b><br>
        `, "/apps/resource/tutorial/q_example_4.png", "920px", "800px");
    }
}


class AOnlyTutorial extends GenericTutorial {

    render_page_1() {
        this.insert_page_title("Task overview");
        this.insert_one_text_entry("In this task, you need to complete the following steps:");

        this.insert_one_text_entry("<b>Step 1</b>: Explore a 3D scene. Try to get familiar with the <b>layout and objects</b> inside. You may refer to following tutorial pages on how to explore the scene.");
        this.insert_one_image_entry("/apps/resource/tutorial/explore_scene_new.gif");

        this.insert_one_text_entry("<b>Step 2</b>: Given a <b>location and orientation</b> (depicted by a <b style=\"color:green;\">green arrow</b>) in the scene and its description (we name them <b>\"context\"</b>), answer a questions about the 3D scene. The answer is expected to be a <b>simple word</b>.");
        this.insert_one_text_entry("ex.");
        this.insert_one_text_entry("<b>Description</b>: I'm sitting on the chair, facing three monitors.");
        this.insert_one_text_entry('<b>Question</b>: Is there a couch on my right?');
        this.insert_one_text_entry('<b>Answer</b>: ? (yes)');
        this.insert_one_text_entry('You also need to select your <b>confidence</b> (Yes / Maybe / No) for the answer.');
    }

    render_page_4() {
        this.insert_page_title("About step 2: Some question-answering examples");

        this.insert_one_image_entry_with_description("<b>Description</b>: I'm facing the sink and there is a towel on my right. <br> <b>What is standing on the floor on my left? -- trash can</b> <br><b>Is there a towel on my right? -- yes</b> <br><b>What is in my 4 o'clock direction? -- door</b>", "/apps/resource/tutorial/desc_example_3.png", "920px", "550px")

        this.insert_one_image_entry_with_description("<b>Description</b>: I'm sitting on the couch in between two pillows, and the TV and an ottoman are both in front of me <br><b>How many pillowss are there on my right? -- three</b> <br><b>Are there two glass tables in front of me? -- no</b>", "/apps/resource/tutorial/q_example_3.png", "920px", "500px");

        this.insert_one_image_entry_with_description("<b>Description</b>: I'm sitting on an armchair, facing a green ottoman and there is a opened door behind me <br><b> What is the color of the cabinet behind me? -- pink</b> <br><b>Does the ottoman in front of me have a round shape? -- no</b> <br><b>Is the door in my 4 o'clock direction opened? -- no</b> <br><b>How many pillowss are there on the couch on my right? -- two</b>", "/apps/resource/tutorial/q_example_4.png", "920px", "800px");

        this.insert_one_image_entry_with_description("<b>Description</b>: I'm playing ping-pong where there is a rug in my 8 o'clock direction <br><b>Which one is closer to me, an armchair or a door? -- armchair</b> <br><b>How many couches can I see? -- two</b> <br><b>Which direction should I go if I want to go upstairs? -- left</b> <br><b>Is there a door on my left? -- yes</b> <br><b>Can I see any trashcan? -- no</b> <br><b>What will I end up with if I keep walking left? -- door</b> <br><b>Can I open any door without moving? -- no</b>", "/apps/resource/tutorial/q_example_5.png", "920px", "800px");
    }
}


class SOnlyNoSelectTutorial extends GenericTutorial {

    render_page_1() {
        this.insert_page_title("Task overview");
        this.insert_one_text_entry("In this task, you need to complete the following steps:");

        this.insert_one_text_entry("<b>Step 1</b>: Explore a 3D scene. Try to get familiar with the <b>layout and objects</b> inside. You may refer to following tutorial pages on how to explore the scene.");
        this.insert_one_image_entry("/apps/resource/tutorial/explore_scene.gif");


        this.insert_one_text_entry("<b>Step 2</b>: Given a <b>location and orientation</b> (depicted by a <b style=\"color:green;\">green arrow</b>) in the scene, describe them with a sentence. The description <b>cannot be ambiguous</b> -- it should locate a <b>unique</b> context picked by you.");
        this.insert_one_text_entry("E.g. I'm waxing the table that is surrounded by some chairs. There is a chair to my immediate right and a few more behind me, making this room pretty crowded.")

        this.insert_rejection_alert("If the descrption is ambiguous or does not match the picked location&orientation, it will be rejected. More on ambiguity will come later in this tutorial.");

        this.insert_rejection_alert("If the descrption is template-alike (simple), it will be rejected. More on this will come later in this tutorial.");
    }


    render_page_2() {
        this.insert_page_title("About step 1: Exploring the scene");
        this.insert_one_image_entry_with_title_description("Rotate", "<span style=\"color: red;\">Right click</span> and drag the scene to rotate", "/apps/resource/tutorial/rotate.gif");
        this.insert_one_image_entry_with_title_description("Move", "<span style=\"color: red;\">Middle click</span> and drag the scene to move", "/apps/resource/tutorial/move.gif");
        this.insert_one_image_entry_with_title_description("Zoom", "Hover the mouse on the scene and <span style=\"color: red;\">scroll the wheel</span> to zoom", "/apps/resource/tutorial/zoom.gif");
    }

    render_page_3() {
        this.insert_page_title("About step 1(cont'd): Exploring objects in the scene");
        this.insert_one_image_entry_with_title_description("Click an object in the scene", "<span style=\"color: red;\">Hover on and left click</span> an object in the scene for its name", "/apps/resource/tutorial/object_click.gif");
        this.insert_one_image_entry_with_title_description("Highlight a group of objects", "<span style=\"color: red;\">Hover on</span> the object group in the list to hightlight their member objects", "/apps/resource/tutorial/object_group.gif");
        this.insert_one_image_entry_with_title_description("Highlight an object instance", "<span style=\"color: red;\">Click</span> the object group to unfold the list and <span style=\"color: red;\">hover on</span> an item to highlight an object instance", "/apps/resource/tutorial/object_item.gif");
    }

    render_page_4() {
        this.insert_page_title("About step 2: How to describe a location and orientation?");

        this.insert_rejection_alert("Ambiguous or wrong description will be rejected.")
        this.insert_one_text_entry("You may use one or more objects to help determine a unique location and orientation. More reference objects can help eliminate the ambiguity.");

        this.insert_one_image_entry_with_description("<b>I'm facing the front door <span style=\"color: red\">×</span></b> -- this is also valid for locations that are further from the door<br> <b>I'm about to walk outside from the front door and there are some trash cans on my left <span style=\"color: green\">√</span></b> <br> <b>Walking towards the door, and I just find a cabinet on my right <span style=\"color: green\">√</span></b>", "/apps/resource/tutorial/desc_example_1.png", "880px", "550px");

        this.insert_one_image_entry_with_description("<b>I'm sitting on a toilet <span style=\"color: red\">×</span></b> -- there are more than one toilet in the scene<br> <b>Sitting on a toilet and trying to get some toilet paper from the holder on my right <span style=\"color: green\">√</span></b> <br> <b>I just entered from the door of this stall on my left and now I'm sitting on the toilet <span style=\"color: green\">√</span></b>", "/apps/resource/tutorial/desc_example_2.png", "920px", "550px");

        this.insert_one_image_entry_with_description("<b>I'm standing on a rug <span style=\"color: red\">×</span></b> -- there are more than one rug in the scene and the orientation is unclear <br> <b>I'm brushing my teeth in front of the sink <span style=\"color: green\">√</span></b> <br> <b>I'm shaving my beard in front of the mirror<span style=\"color: green\">√</span> </b>", "/apps/resource/tutorial/desc_example_3.png", "920px", "550px");

        this.insert_rejection_alert("Template-alike (low efforts) descriptions will be rejected.");
        this.insert_one_text_entry("You may use common human activities over these objects in your descriptions. Try to imagine some real-life situations and put them into your sentences.");

        this.insert_one_image_entry_with_description(`
        <b>I'm facing the microwave and there is a table behind me <span style=\"color: red\">×</span></b> -- I'm facing A and there is B behind/on my right/on my left/etc, template-alike <br>

        <b>I'm standing in front of the microwave while having a fridge to my right </b> <span style=\"color: red\">×</span></b> -- I'm in front of A while having B behind/on my right/on my left/etc, template-alike <br>

        <b>I'm leaning on the kitchen counter waiting for my food to be heated in front of me <span style=\"color: green\">√</span></b><br>

        <b>Just picked up some frozen food from the fridge on my right and putting them inside the microwave now <span style=\"color: green\">√</span></b><br>

        <b>

        `, "/apps/resource/tutorial/desc_example_4.png", "920px", "500px");

        this.insert_one_image_entry_with_description(`

        <b>I'm standing in front of the copier and there is a printer on my left <span style=\"color: red\">×</span></b> -- I'm standing in front of A and there is B on my right/left/etc, template-alike<br>

        <b>I'm sitting in front of the copier and there is a printer on my left <span style=\"color: red\">×</span></b> -- I'm sitting in front of A and there is B on my right/left/etc, template-alike<br>

        <b>I'm scanning some paperwork while the printer on my 10 o'clock direction is being maintained.</b><span style=\"color: green\">√</span></b><br>

        <b>Waiting for my paper to be scanned, I'm trying to throw a paper ball into the trash can on my 1 o'clock direction.</b><span style=\"color: green\">√</span></b><br>

        `, "/apps/resource/tutorial/desc_example_6.png", "920px", "500px");
    }
}