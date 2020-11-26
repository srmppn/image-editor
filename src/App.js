import logo from './logo.svg';
import React from 'react'
import './App.css';
import 'tui-image-editor/dist/tui-image-editor.css';
import { Button } from 'react-bootstrap';
import { fabric } from 'fabric';

class App extends React.Component {
  constructor(){
    super();
    this.state = {
      canvas: null,
      hueSet: false,
      hueValue: 0,
      rgbSet: false,
      r: 0,
      g: 0,
      b: 0,
      hasSelect: false
    }
  }

  componentDidMount = () => {
    var canvas = new fabric.Canvas('canvas', {
      width: '600',
      height: '600',
      backgroundColor: 'lightgray'
    })
    canvas.on('selection:created', (param) => {
      const filter = param.selected[0].filters
      if(typeof filter[0] !== "undefined"){
        this.setState({hueSet: filter[0].isSet, hueValue: filter[0].rotation})
      }
      if(typeof filter[1] !== "undefined"){
        this.setState({rgbSet: filter[1].isSet, r: filter[1].gamma[0], g: filter[1].gamma[1], b: filter[1].gamma[2]})
      }
      this.setState({hasSelect: true})
    })
    canvas.on('selection:cleared', (parama) => {
      this.setState({hasSelect: false})
    })
    canvas.renderAll();
    this.setState({canvas: canvas});
    window.onkeydown = this.onKeyDownHandler;
  }

  onKeyDownHandler = (e) => {
    switch (e.keyCode) {
      case 8: // delete
        var object = this.state.canvas.getActiveObject();
        this.state.canvas.remove(object);
    }
    e.preventDefault(); 
  }

  onClickAddImage = (e) => {
    const reader = new FileReader()
    const imageFile = e.target.files[0]
    reader.readAsDataURL(imageFile)
    reader.onloadend = () => {
      fabric.Image.fromURL(reader.result, img => {
        this.state.canvas.add(img);
        this.state.canvas.requestRenderAll();
      })
    }
  }
  
  onChangeApplyFilter = (filter) => {
    var obj = this.state.canvas.getActiveObject();
    if(obj){
      switch(filter){
        case 'hue': 
          obj.filters[0] = this.state.hueSet && new fabric.Image.filters.HueRotation({rotation: this.state.hueValue, isSet: true})
          break;
        case 'rgb':
          const { r,g,b } = this.state
          obj.filters[1] = this.state.rgbSet && new fabric.Image.filters.Gamma({gamma: [r,g,b], isSet: true})
          break;
        default:
      }
      obj.applyFilters()
      this.state.canvas.requestRenderAll();
    }
  }

  onChangeHandlerCheckBox = async (e, filter) => {
    await this.setState({[e.target.name]: e.target.checked})
    this.onChangeApplyFilter(filter)
  }

  onChangeHandlerRange = (e, filter) => {
    this.setState({[e.target.name]: e.target.value})
    this.onChangeApplyFilter(filter)
  }

  render = () => {
    const { hueSet, hueValue, rgbSet, r, g, b } = this.state
    return (
      <div className="App">
        <canvas className="image-editor" id="canvas"></canvas>
        <div className="editor">
          <input className="outline-primary" type="file" accept="image/*" onChange={this.onClickAddImage}/>
          {this.state.hasSelect ? 
            <>
            <div className="hue-editor">
              <div>
                <label className="mr-2">ปรับค่า hue :</label>
                <input name="hueSet" type="checkbox" checked={hueSet} onChange={(e) => this.onChangeHandlerCheckBox(e, 'hue')}/>
              </div>
              <div className="d-flex">
                <span className="mr-2">ระดับ :</span>
                <input name="hueValue" style={{"width": "80%"}} value={hueValue} type="range" min="-2" max="2" step="0.002" onChange={(e) => this.onChangeHandlerRange(e, 'hue')}/>
              </div>
            </div>
            <div className="hue-editor">
              <div>
                <label className="mr-2">ระดับค่า gamma :</label>
                <input name="rgbSet" type="checkbox" checked={rgbSet} onChange={(e) => this.onChangeHandlerCheckBox(e, 'rgb')}/>
              </div>
              <div className="d-flex">
                <span className="mr-2">R :</span>
                <input name="r" style={{"width": "80%"}} value={r} type="range" min="0.2" max="2.2" step="0.003921" onChange={(e) => this.onChangeHandlerRange(e, 'rgb')}/>
              </div>
              <div className="d-flex">
                <span className="mr-2">G :</span>
                <input name="g" style={{"width": "80%"}} value={g} type="range" min="0.2" max="2.2" step="0.003921" onChange={(e) => this.onChangeHandlerRange(e, 'rgb')}/>
              </div>
              <div className="d-flex">
                <span className="mr-2">B :</span>
                <input name="b" style={{"width": "80%"}} value={b} type="range" min="0.2" max="2.2" step="0.003921" onChange={(e) => this.onChangeHandlerRange(e, 'rgb')}/>
              </div>
            </div>
          </>
          :
          <div className="p-3">กรุณาเลือกภาพที่ต้องการเพื่อปรับแต่งสีภาพ</div>
          }
        </div>
      </div>
    );
  }
}

export default App;
