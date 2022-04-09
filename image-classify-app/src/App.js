import axios from 'axios';
import React, { Component } from 'react';
import Webcam from "react-webcam";
import './App.css';

class App extends Component {

  state = {
    selectedImage: null,
    ImageURL: null,
    capturedImage: null,
  };

  onImageChange = event => {

    this.setState({ selectedImage: event.target.files[0] }, () => {
      console.log(this.state.selectedImage);
      const formData = new FormData();

      formData.append(
        "image",
        this.state.selectedImage
      );

      this.predictImage(formData);

    });
    this.setState({ ImageURL: URL.createObjectURL(event.target.files[0]) }, () => {
      console.log(this.state.ImageURL);
      document.getElementById("img-pred").style.borderStyle = "ridge";
      document.getElementById("img-pred").style.borderColor = "#aebfbe";
      
    });

    
  };

  predictImage = (imageData) => {

    var config = {
      method: 'post',
      url: 'http://127.0.0.1:8080/classify',
      headers: {},
      data: imageData
    };

    axios(config)
      .then(function (response) {
        const jsonResponse = response.data
        console.log(jsonResponse.class);
        console.log(jsonResponse.percentage);
        document.getElementById("prediction").innerHTML = "The Image is Classified as : "+jsonResponse.class;
      })
      .catch(function (error) {
        console.log(error);
      });

  };

  WebcamCapture = () => {
    const videoConstraints = {
      width: "90%",
      facingMode: "user"
    };
    const webcamRef = React.useRef(null);

    const capture = React.useCallback(
      () => {
        const imageSrc = webcamRef.current.getScreenshot();

        var byteString = atob(imageSrc.split(',')[1]);
        var arrayBuffer = new ArrayBuffer(byteString.length);
        var uint8Array = new Uint8Array(arrayBuffer);

        for (var i = 0; i < byteString.length; i++) {
          uint8Array[i] = byteString.charCodeAt(i);
        }
        var blob = new Blob([uint8Array], {
          type: 'image/jpeg'
        });
        const imageFile = new File([blob], "image.jpg");
        const imageFileURL = URL.createObjectURL(imageFile);


        this.setState({ capturedImage: imageFile }, () => {

          console.log(this.state.capturedImage);

          const formData = new FormData();

          formData.append(
            "image",
            this.state.capturedImage
          );
          this.predictImage(formData);
        });



        this.setState({ ImageURL: imageFileURL }, () => {
          console.log(this.state.ImageURL);
          document.getElementById("img-pred").style.borderStyle = "ridge";
          document.getElementById("img-pred").style.borderColor = "#aebfbe";

        });
        

      },
      [webcamRef]
    );


    return (
      <>
        <Webcam style={{borderStyle: "ridge",borderColor: '#aebfbe'}}
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={"90%"}
          videoConstraints={videoConstraints}
        />
        <br></br>
        <br></br>
        <button className='btn btn-primary' onClick={capture} >Capture Photo</button>

      </>
    );

  };

  render() {

    return (
      <div>
<div>
          <h1 className="App">
            Image Classification
          </h1>
        </div>
     
      <div className='container'>
        
        <div className='row'>          
          <div className='card border-primary col-sm-12 col-lg-4'>
            <h4 className='card-header h4-text'>
              Upload Image
            </h4>
            <div className='card-body div-upload'>
              <input type="file" accept="image/*" onChange={this.onImageChange} />              
            </div>
            <br></br>
            <br></br>
          </div>
          
          <div className='card border-primary col-sm-12 col-lg-4'>
            <h4 className='card-header h4-text'>
              Capture Image
            </h4>
            <div className='card-body div-capture' >
              <this.WebcamCapture />
            </div>
            <br></br>
            <br></br>
          </div>
          
          <div className='card border-primary col-sm-12 col-lg-4'>
            <h4 className='card-header h4-text' id="result">Prediction</h4>
            <div className='card-body div-pred'>
            <img width="90%" id='img-pred'  src={this.state.ImageURL} />
            </div>
            <br></br>
            <br></br>
            <div className='card-footer'>
            <p  className='p-text' id="prediction"></p>
            
          </div>
        </div>
        </div>
      </div>
      </div>
    );
  }
}

export default App;
