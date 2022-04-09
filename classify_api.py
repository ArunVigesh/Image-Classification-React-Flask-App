from torchvision import models, transforms
from PIL import Image
import numpy as np
import torch
import io
import cherrypy
import cherrypy_cors


class ImageClassifier(object):
  def __init__(self):  
    with open('imagenet_classes.txt') as f:
      self.classes = [line.strip() for line in f.readlines()]
        
    self.transform = transforms.Compose([
                                    transforms.Resize(256),
                                    #transforms.CenterCrop(224),
                                    transforms.ToTensor(),
                                    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
                                    ])

    self.resnet = models.resnet18(pretrained=True)
    self.resnet.eval()

  @cherrypy.expose()
  def index(self):
    return '{"value": "success"}\n'


  @cherrypy.expose
  @cherrypy.tools.json_out()
  def classify(self, image):
    image_arr=np.array(Image.open(io.BytesIO(image.file.read())).convert('RGB'))
    img = Image.fromarray(image_arr)      
    img_t = self.transform(img)
    batch_t = torch.unsqueeze(img_t, 0)

    with torch.no_grad():
      out = self.resnet(batch_t)

    _, indices = torch.sort(out, descending=True)
    percentage = torch.nn.functional.softmax(out, dim=1)[0] * 100
    prediction=[(self.classes[idx], percentage[idx].item()) for idx in indices[0][:1]][0]
    response_json={"class":prediction[0],"percentage":prediction[1]}
    return response_json
    
if __name__ == '__main__':
    cherrypy_cors.install()
    config = {
              '/': {
                  'cors.expose.on': True,
              },
          }
    cherrypy.quickstart(ImageClassifier(),config=config)
    
