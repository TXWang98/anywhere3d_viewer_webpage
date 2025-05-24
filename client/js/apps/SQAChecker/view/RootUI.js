import React from "react";

class RootUI extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id="root_container" style={{"position": "absolute", "width": "80%", "height": "90%", "marginTop": "100px", "marginLeft": "10%", "marginRight": "15%"}}>
                <div id="content_container" style={{"position": "absolute", "width": "100%", "height": "100%"}}>
                    <div id="control_container" style={{"position": "absolute", "width": "90%", "height": "90%", "marginLeft": "5%", "boxShadow": "5px 5px 20px 20px #ccc", "borderRadius": "8px", "overflow": "auto", "zIndex": "1000", "backgroundColor": "white", "display": "none"}}>
                        <div style={{"position": "absolute", "width": "90%", "height": "95%", "marginTop": "50px", "marginLeft": "5%"}}>
                            <div id="control_content"></div>
                            <center><button id="close_control" type="button" className="btn btn-primary" style={{"width": "100px", "fontSize": "18px", "marginTop": "20px", "marginBottom": "50px"}}>Close</button></center>
                        </div>
                    </div>
                    <div id="info_container" style={{"position": "absolute", "width": "90%", "height": "90%", "marginLeft": "5%", "boxShadow": "5px 5px 20px 20px #ccc", "borderRadius": "8px", "overflow": "auto", "zIndex": "1000", "backgroundColor": "white", "display": "none"}}>
                        <div style={{"position": "absolute", "width": "90%", "height": "95%", "marginTop": "50px", "marginLeft": "5%"}}>
                            <div id="info_content"></div>
                            <center><button id="close_info" type="button" className="btn btn-primary" style={{"width": "100px", "fontSize": "18px", "marginTop": "20px", "marginBottom": "50px"}}>Close</button></center>
                        </div>
                    </div>
                    <div id="view_container">
                        <button type="button" id="btn_none" className="btn btn-outline-primary">Object only</button>
                        <button type="button" id="btn_surface" className="btn btn-outline-primary">Full scan</button>
			{/* <button type="button" id="btn_screenshot" className="btn btn-outline-primary">screenshot</button> */}
                        {/* <button type="button" id="btn_instance" className="btn btn-default">instance</button> */}
                    </div>
                    {/* <div>
                        <label id="label_ALL" className="btn btn-lg btn-default" style={{"textAlign": "left", "height": "45px", "width": "250px"}}>
                            <span style={{"float": "left"}}>ALL</span>
                        </label>
                    </div> */}
                    <div>
                        <div id="loading_container" style={{"position": "absolute", "width": "80%", "height": "70%", "float": "left", "display": "block"}}>
                            {/* <img src="../../../../images/Spinner-1s-200px.gif" style={{}}/> */}
                            <div id="loading_bar" style={{"position": "absolute", "width": "0%", "height": "10px", "backgroundColor": "#23639a", "transition": "width 0.2s"}}></div>
                        </div>
                        <div id="canvas_container" style={{"position": "absolute", "width": "80%", "height": "65%", "float": "left"}}>
                            <canvas id="canvas" style={{"width": "100%", "height": "100%"}}/>
                        </div>
                        {/* <div id="image_container" style={{"position": "absolute", "width": "20%", "height": "23%", "marginLeft": "60%", "float": "left", "display": "none"}}>
                            <img id="image" style={{"position": "absolute", "width":"100%", "height": "100%"}}/>
                            <div id="frame_loading_container" style={{"position": "absolute", "width":"100%", "height": "40%", "display": "block"}}>
                                <div id="frame_loading_bar" style={{"position": "absolute", "width": "0%", "height": "10px", "backgroundColor": "#23639a"}}></div>
                                <label style={{"position": "absolute", "color": "#23639a", "marginTop": "10px"}}>Loading gallery: <span id="frame_loading_progress"></span>%</label>
                            </div>
                        </div> */}
                        <div id="button_container" style={{"position": "absolute", "height": "65%", "marginLeft": "83%", "float": "left", "display": "none"}}>
                            <div style={{"position": "absolute"}}>
                                <label id="label_ALL" style={{"textAlign": "left", "width": "320px"}}>
                                    <span style={{"float": "left", "fontSize": "30px"}}><b>List of objects</b></span>
                                </label>
                            </div>
                            <div id="label_container" style={{"position": "absolute", "top": "50px", "height": "90%", "overflow": "auto"}}>

                            </div>
                        </div>
                    </div>
                    {/* <div style={{"position": "absolute", "width": "100%", "height": "20%", "top": "75%", "overflow": "auto"}}>
                        <div>
                            <div style={{"width": "6%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>Obj.</label>
                            </div>
                            <div style={{"width": "6%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>Ann.</label>
                            </div>
                            <div style={{"width": "6%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>Status</label>
                            </div>
                            <div style={{"width": "8%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>AW.ID</label>
                            </div>
                            <div style={{"width": "8%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>VW.ID</label>
                            </div>
                            <div style={{"width": "46%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>Description</label>
                            </div>
                            <div style={{"width": "20%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>Operation</label>
                            </div>
                        </div>
                        <div id="ViewUI" style={{"height": "100%"}}>
                        </div>
                    </div> */}
                    <div id='sqa_input' style={{"position": "absolute", "width": "100%", "height": "80%", "top": "70%", "overflow": "visible"}}>
                        {/* <table className="table table-striped table-hover" style={{"width": "100%"}}>
                            <thead>
                                <tr>
                                    <th style={{"width": "10%", "height": "50px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                        <label style={{"color": "white", "fontSize": "16px", "marginLeft": "5px"}}>Obj.</label>
                                    </th>
                                    <th style={{"width": "10%", "height": "50px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                        <label style={{"color": "white", "fontSize": "16px", "marginLeft": "5px"}}>Ann.</label>
                                    </th>
                                    <th style={{"width": "6%", "height": "50px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                        <label style={{"color": "white", "fontSize": "16px", "marginLeft": "5px"}}>Status</label>
                                    </th>
                                    <th style={{"width": "8%", "height": "50px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                        <label style={{"color": "white", "fontSize": "16px", "marginLeft": "5px"}}>AW.ID</label>
                                    </th>
                                    <th style={{"width": "8%", "height": "50px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                        <label style={{"color": "white", "fontSize": "16px", "marginLeft": "5px"}}>VW.ID</label>
                                    </th>
                                    <th style={{"width": "60%", "height": "50px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                        <label style={{"color": "white", "fontSize": "16px", "marginLeft": "5px"}}>Description</label>
                                    </th>
                                    <th style={{"width": "20%", "height": "50px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                        <label style={{"color": "white", "fontSize": "16px", "marginLeft": "5px"}}>Operation</label>
                                    </th>
                                </tr>
                            </thead>
                            <tbody id="ViewUI"></tbody>
                        </table> */}
                        <h1><hr/></h1>
                        <div>
                            <label htmlFor="S" style={{font: "30px bold"}}>Please check the following and the position of the green arrow. If there is anything wrong, modify and click 'submit'.</label>
                        </div>
                        <div>
                        <p style={{display:'inline', fontSize: "30px"}}>Total: </p> <ins style={{display:'inline', fontSize: "30px", color:'blue'}} id='ins_total_number'>0</ins><p style={{display:'inline', fontSize: "30px"}}>   You're now at: </p><ins style={{display:'inline', fontSize: "30px", color:'blue'}} id='ins_current_number'>0</ins>
                        </div>
                        <div>
                        <p style={{display:'inline', fontSize: "15px"}}>hash1: </p> <ins style={{display:'inline', fontSize: "15px", color:'blue'}} id='ins_hash1'></ins> <p style={{display:'inline', fontSize: "15px"}}>hash2: </p> <ins style={{display:'inline', fontSize: "15px", color:'blue'}} id='ins_hash2'></ins> <p style={{display:'inline', fontSize: "15px"}}>task_db: </p> <ins style={{display:'inline', fontSize: "15px", color:'blue'}} id='ins_task_db'></ins>
                        </div>
                        <div>
                            <label htmlFor="S" style={{font: "35px bold"}}>Situation</label>
                            <p style={{display:'inline', color:'red'}}> --- A sentence of describe the</p><p style={{display:'inline', color:'red', fontSize: '25px'}}> position and orientation</p><p style={{display:'inline', color:'red'}}> of the</p><p style={{display:'inline', color:'green', fontSize: '25px'}}> green arrow </p><p style={{display:'inline', color:'red'}}> without ambiguity.</p>
                            <input type="text" className="form-control" id="sqa_situation" placeholder="" required=""></input>
                        </div>
                        <div>
                            <label htmlFor="Q" style={{font: "35px bold"}}>Question</label>
                            <p style={{display:'inline', color:'red'}}> --- A sentence of the question you ask.</p>
                            <input type="text" className="form-control" id="sqa_question" placeholder="" required=""></input>
                        </div>
                        <div>
                            <label htmlFor="A" style={{font: "35px bold"}}>Answer</label><p style={{display:'inline', color:'red'}}> --- It is expected to be a </p><p style={{display:'inline', color:'red', fontSize: '25px'}}> single word.</p>
                            <input type="text" className="form-control" id="sqa_answer" placeholder="" required=""></input>
                        </div>
                        <button className="btn btn-outline-secondary" type="submit" id="btn_sqa_prev" style={{"marginTop": "15px", "marginRight": "20px"}}>← Prev</button>
                        <button className="btn btn-outline-primary" type="submit" id="btn_sqa_submit" style={{"marginTop": "15px", "marginLeft": "20px", "marginRight": "20px"}}>Update</button>
                        <button className="btn btn-outline-danger" type="submit" id="btn_sqa_delete" style={{"marginTop": "15px", "marginLeft": "20px", "marginRight": "20px"}}>Delete</button>
                        <button className="btn btn-outline-info" type="submit" id="btn_sqa_insert" style={{"marginTop": "15px", "marginLeft": "20px", "marginRight": "20px"}}>Insert</button>
                        <button className="btn btn-outline-secondary" type="submit" id="btn_sqa_next" style={{"marginTop": "15px", "marginLeft": "20px", "marginRight": "20px"}}>Next →</button>
                    </div>
                </div>
            </div>
        );
    }

}





export default RootUI;
