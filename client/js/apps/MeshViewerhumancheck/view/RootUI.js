import React from "react";

class RootUI extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id="root_container" style={{"position": "absolute", "width": "80%", "height": "90%", "marginTop": "100px", "marginLeft": "10%", "marginRight": "15%"}}>
                <div id="content_container" style={{"position": "absolute", "width": "100%", "height": "100%"}}>
                    <div id="view_container">
                        <button type="button" id="btn_none" className="btn btn-outline-primary">Object only</button>
                        <button type="button" id="btn_surface" className="btn btn-outline-primary">Full scan</button>
                    </div>
                    <div>
                        <div id="loading_container" style={{"position": "absolute", "width": "80%", "height": "70%", "float": "left", "display": "block"}}>
                            <div id="loading_bar" style={{"position": "absolute", "width": "0%", "height": "10px", "backgroundColor": "#23639a", "transition": "width 0.2s"}}></div>
                        </div>

                        <div id="control_bar_container" style={{"position": "absolute", "height": "65%", "left": "0%", "width": "29%", "float": "left", "display": "none"}}>
                            <div style={{"position": "absolute"}}>
                                <label id="control_bar_container_caption" style={{"textAlign": "left", "width": "320px"}}>
                                    <span style={{"float": "left", "fontSize": "30px"}}><b>Control Bar</b></span>
                                </label>
                            </div>
                            <br/>
                            <br/>
                            <div id="control_bar_controls" style={{"position": "absolute", "top": "50px", "height": "92%", "width": "100%", "overflow": "auto"}}></div>
                        </div>

                        <div id="canvas_container" style={{"position": "absolute", "height": "65%", "left": "30%", "width": "54%", "float": "left"}}>
                            <canvas id="canvas" style={{"width": "100%", "height": "100%"}}/>
                        </div>
                        <div id="button_container" style={{"position": "absolute", "height": "65%", "left": "85%", "width": "15%", "float": "left", "display": "none"}}>
                            <div style={{"position": "absolute"}}>
                                <label id="label_ALL" style={{"textAlign": "left", "width": "320px"}}>
                                    <span style={{"float": "left", "fontSize": "30px"}}><b>List of objects</b></span>
                                </label>
                            </div>
                            <div id="label_container" style={{"position": "absolute", "top": "50px", "height": "90%", "overflow": "auto"}}>

                            </div>
                        </div>

                    </div>
                    <div id='sqa_input' style={{"position": "absolute", "width": "100%", "height": "80%", "top": "70%", "overflow": "visible"}}>
                    </div>
                </div>
            </div>
        );
    }

}





export default RootUI;
