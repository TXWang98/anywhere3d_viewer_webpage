import React from "react";

class RootUI extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id="root_container" style={{"width": "80%", "height": "90%", "marginTop": "100px", "marginLeft": "10%", "marginRight": "15%"}}>

                    <div id='btn_input' style={{"width": "80%", "height": "100%", "top": "10%", "position": "absolute"}}>
                        <button className="btn btn-outline-secondary" type="submit" id="btn_prev" style={{"marginTop": "15px", "marginRight": "20px"}}>← Prev</button>
                        <button className="btn btn-outline-secondary" type="submit" id="btn_next" style={{"marginTop": "15px", "marginLeft": "20px", "marginRight": "20px"}}>Next →</button>
                    </div>

                    <div id="tutorial_container" style={{"width": "80%", "height": "100%", "top": "20%", "position": "absolute"}}>

                    </div>


                </div>
        );
    }

}


export default RootUI;
