import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Row,
  Col,
  Input,
  Container
} from "reactstrap";


// react-pdf
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5';
import interact from "interactjs";
import reactable from 'reactablejs'
import Qrcode from "./qrcode";
import Qrtitle from "./qrtitle";

// load document 
// import { b64toBlob } from "./helpers/b64toBlob";

// INTERACTJS
// import Interactable from "../../helpers/Interactable";

const Reactable = reactable(Qrcode)
const ReactableTitle = reactable(Qrtitle)





function Reactablejs() {
  const ref = useRef(null);
  const navDocumentRenderRef = useRef(null);

  const [refWidth, setRefWidth]= useState(0);
  const [refHeight, setRefHeight] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(null);
  const [coordinate, setCoordinate] = useState({ x: 0, y: 0, width: 90})
  const [coordinateTitle, setCoordinateTitle] = useState({ x: 100, y: 0})
  const [qrcodeData, setQrcodeData] = useState(0);

  //   hide-on-mobile state 
  const [displayMobile, setDisplayMobile] = useState('block')

  // display qr properties
  const [displayQr, setDisplayQr] = useState('none')
  const [fileName, setFileName] = useState('Pilih Dokumen')
  const [pdfBuffer, setPdfBuffer] = useState('')


  // pdf loading
  let file, reader = new FileReader();

  const handleFileChange = async(e) => {
    console.log('file inputed')
    file = e.target.files[0];
    setFileName(e.target.files[0].name);
    console.log(fileName)
    let data = null;

    if (typeof(file) != 'undefined'){
      reader.readAsArrayBuffer(file)
      reader.onloadend = await function(e){
          data = e.target.result
          setPdfBuffer(data)
        setDisplayMobile('block')
      }
    } 
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
    setPageNumber(1)
  }

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  const previousPage = () => {
    changePage(-1)
  }

  const nextPage = () => {
    changePage(1)
  }

  const handleQrClick = () => {
    //   console.log(qrcodeData);
    setQrcodeData(qrcodeData+1)
  }

  useEffect(() => {
    setRefWidth(ref.current.offsetWidth)
    setRefHeight(ref.current.offsetHeight)
  },[refHeight,ref])

    const dragOptions = {
        onmove: (event) =>  {
            setCoordinateTitle(prev => ({
            ...prev,
            x: prev.x + event.dx,
            y: prev.y + event.dy,
            }))
        },
        modifiers: [
            interact.modifiers.restrictRect({
            restriction: 'parent',
            endOnly: true
            })
        ],
    }

    const resizeOptions = {
        edges: { left: true, right: true, bottom: true, top: true },
        onmove: (e) => {
            const { width, height } = e.rect
            const { left, top } = e.deltaRect
            setCoordinateTitle(prev => {
            return {
                x: prev.x + left,
                y: prev.y + top,
                width,
                height
            }
            })
        },
        modifiers: [
            interact.modifiers.restrictEdges({
            outer: 'parent',
            endOnly: true
            }),
        ]
    }

    const dragQrOptions = {
        onmove: (event) =>  {
            setCoordinate(prev => ({
            ...prev,
            x: prev.x + event.dx,
            y: prev.y + event.dy,
            }))
        },
        modifiers: [
            interact.modifiers.restrictRect({
            restriction: 'parent',
            endOnly: true
            })
        ],
        }

    const resizeQrOptions = {
        edges: { left: true, right: true, bottom: true, top: true },
        onmove: (e) => {
            const { width, height } = e.rect
            const { left, top } = e.deltaRect
            setCoordinate(prev => {
            return {
                x: prev.x + left,
                y: prev.y + top,
                width,
                height
            }
            })
        },
        modifiers: [
            interact.modifiers.restrictEdges({
            outer: 'parent',
            endOnly: true
            }),
        ]
        }

  return (
    <div className="page-content">
      <Container>        
        <Row> 
          <Row className="g-0 py-4">  
            {/* left side */}
            <Col lg={8} className="text-center px-5 mobile-padding-0"> 
              <Row className="navDocumentRender py-4">
                <Col lg={8} md={6} sm={12}> 
                  <div> 
                    <Input className="form-control form-control-sm" id="formSizeSmall" type="file" accept="application/pdf"  onChange={(e) => handleFileChange(e)} required  />
                  </div>
                </Col>
                <Col lg={4} md={6} sm={12} style={{display: `${displayMobile}`}} ref={navDocumentRenderRef}>
                  <div className="d-flex align-items-center justify-content-between align-middle-mobile">  
                    <div>Halaman {pageNumber || (numPages ? 1 : '--')} dari {numPages || '--'}</div>
                    <div>
                        <Button size="sm" color="primary" onClick={previousPage} disabled={pageNumber <= 1} className="btn-icon mx-1">
                            Prev
                        </Button>
                        <Button size="sm" color="primary" onClick={nextPage} disabled={pageNumber >= numPages} className="btn-icon mx-1">
                            Next
                        </Button>
                    </div> 
                  </div>     
                </Col>
              </Row>
              <Row>
                <div className="card p-3 docRenderContainer d-flex justify-content-center h-100 " style={{backgroundColor:'lightgrey'}}>
                    <div className="cardBody docRender" ref={ref}>
                        
                        
                        <Reactable draggable={dragQrOptions} resizable={resizeQrOptions} {...coordinate} /> 

                        {/* <ReactableTitle draggable={dragOptions} resizable={resizeOptions} {...coordinateTitle}/>  */}
                        <div>
                            <Document 
                                    file={pdfBuffer} 
                                    onLoadSuccess={onDocumentLoadSuccess} 
                                    loading='loading data'
                                    renderMode="canvas" 
                                    > 
                                    <div className="dropzone">
                                      <Page 
                                          pageNumber={pageNumber || 1} 
                                          width={refWidth}
                                          scale={1}
                                          >
                                      </Page>
                                    </div>
                                </Document>
                        </div>
                    </div>
                </div>
              </Row>
            </Col>

            {/* right side */}
            <Col lg={4} className="px-3">
              <Row>
                <div className="mx-auto text-center justify-content-center py-3" >  
                  <h3 className="text-center">QR Code Properties {qrcodeData}</h3>
                  <Row className="mt-5 d-flex justify-content-center">
                    <Button className="btn-sm w-25" onClick={handleQrClick}>Add QR Code</Button>
                  </Row>
                </div>
              </Row>
            </Col>
          </Row>
        </Row>
      </Container>
    </div>
  );
}

export default Reactablejs;