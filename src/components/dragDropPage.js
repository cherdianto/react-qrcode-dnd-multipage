import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Row,
  Col,
  Input,
  Container
} from "reactstrap";
// import { memo } from "react";
import useStateRef  from 'react-usestateref'

// react-pdf
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5';
import interact from "interactjs";

// load document 
// import { b64toBlob } from "./helpers/b64toBlob";

// INTERACTJS
// import Interactable from "../../helpers/Interactable";

function dragMoveListener(event){
    var target = event.target;
    console.log(target)
    var x= (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
    var y= (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

    // translate the element
    target.style.transform = "translate(" + x + "px, " + y + "px)";
    target.style.border = "4px solid blue"

    // update position attributes
    target.setAttribute("data-x", x);
    target.setAttribute("data-y", y);

    console.log(x, y)

}



function dragStartListener(event){
  console.log('start move')
  event.target.style.border = "4px dashed blue"
}

function resizeMoveListener(event){
  const target = event.target;
  console.log('resize routine')
  console.log(event.currentTarget.id)
  // const { x: stateX, y: stateY } = this.state;
  let x = parseFloat(target.getAttribute("data-x")) || 0;
  let y = parseFloat(target.getAttribute("data-y")) || 0;

  // update the element's style
  target.style.width = `${event.rect.width}px`;
  target.style.height = `${event.rect.height}px`;
  // target.style.fontSize = `${event.rect.height}px`;

  // translate when resizing from top or left edges
  x += event.deltaRect.left;
  y += event.deltaRect.top;

  target.style.webkitTransform = target.style.transform = `translate(${x}px,${y}px)`;
}






function DragDropPage(props) {
  const ref = useRef(null);
  const propertiesQrRef = useRef(null);
  const navDocumentRenderRef = useRef(null);

  const [refWidth, setRefWidth]= useState(0);
  const [refHeight, setRefHeight] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(null);
  const [itemdraggables, setItemdraggables, itemdraggablesRef] = useStateRef([]);
  const [showUpdate, setShowUpdate, showUpdateRef] = useStateRef('');
  const [doUpdate, setDoUpdate] = useState(0);

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
    // displayQr === 'none' ? setDisplayQr('block') : setDisplayQr('none')
    // setOpen(false)
    console.log(itemdraggables)
    console.log(itemdraggablesRef.current)
    setItemdraggables((itemdraggables) => [
      ...itemdraggables,
      { id: `drag-${itemdraggables.length}`,
        page: pageNumber,
        width: null,
        height: null,
        posX: null,
        posY: null,}
    ]);
    console.log(itemdraggables)
  }

  useEffect(() => {
    setRefWidth(ref.current.offsetWidth)
    setRefHeight(ref.current.offsetHeight)
  },[refHeight,ref])

  useEffect(() => {
    
    // DROPZONE OPTIONS
    interact('.dropzone').dropzone({
        accept: '.draggable',
        overlap: 0.75,

        // ondropactivate: function (event){
        //     // console.log(event.target)
        //     // event.target.classList.add("dropactive");
        //     // event.target.style.border = "4px dashed pink";
        // },
        // ondragenter: function(event){
        //     var draggableElement = event.relatedTarget;
        //     var dropzoneElement = event.target;

        //     dropzoneElement.classList.add("droptarget");
        //     draggableElement.classList.add("candrop");
        //     draggableElement.style.border = "4px dashed yellow";

        // },
        // ondragleave: function (event) {
        //     event.target.classList.remove("droptarget");
        //     event.relatedTarget.classList.remove("candrop");
        //     event.target.style.border = "4px dashed green";
        //     event.relatedTarget.style.border = "4px dashed red";
            
        // },
        // ondropdeactivate: function (event) {
        //     event.target.classList.remove("dropactive");
        //     event.target.classList.remove("droptarget");
        // }
    });

    // RESIZE OPTIONS
    interact('.resizable').resizable({
      edges: { top: true, left: true, bottom: true, right: true },
      modifiers: [
        interact.modifiers.aspectRatio({
          ratio: 'preserve',
          modifiers: [
            interact.modifiers.restrictSize({ max: 'parent'})
          ]
        }),
        interact.modifiers.restrictEdges({
          outer: 'parent',
          endOnly: true
          }),
      ],
      listeners: {
        move: resizeMoveListener
      }
    });

    // DRAG OPTIONS
    interact('.draggable').draggable({
        inertia: true,
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: ".docRender",
                endOnly: true
            })
        ],
        autoScroll: false,
        listeners: { move: dragMoveListener, start: dragStartListener, end: dragEndListener}
    });
    setDoUpdate(doUpdate + 1); // flag untuk update tampilan setelah ada perubahan dari interact
  },[])

  
  function dragEndListener(event){
    const itemId = event.currentTarget.id;
    const itemdraggablestemp = itemdraggablesRef.current;

    itemdraggablestemp.find((item, index) => {
      if(item.id === itemId) {
        let x = parseFloat(event.target.getAttribute("data-x")) || 0;
        let y = parseFloat(event.target.getAttribute("data-y")) || 0;
        itemdraggablestemp[index] = {...itemdraggablestemp[index], posX: x, posY: y }

        setItemdraggables([...itemdraggablestemp])
        // console.log(itemdraggablesRef.current)
      }else {
        console.log('error')
      }
    })
  }

  useEffect(() => {
    setShowUpdate(JSON.stringify(itemdraggablesRef.current, null, 2))
  },[itemdraggablesRef.current])

  function QrDraggables ({ elements, page }){
    return (
      <>
        { elements && 
          elements.map((drag, idx) => {
            if( idx !== null && drag.page === page)
            return (
              <QrCodeElement
                id={drag.id}
                key={`draggable-${idx}`}
                posX= {drag.posX}
                posY = {drag.posY}
                index = {idx}
              />
            )
          })
        }
      </>
    )
  }

  const QrCodeElement = ({ id, posX, posY, idx }) => {
    const transf = 'translate('+ posX+'px,'+posY+'px)'
    return (
      <>
        <div 
          className="qr-code draggable resizable" 
          style={{width:'90px', height: '90px', minWidth: '90px', minHeight: '90px', transform: transf}}
          id={id} data-x={posX} data-y={posY}>
          <div className="pos-relative">
            <Button itemdrag={id} onClick={(e) => {handleDeleteBtn(e)}} size="sm" className="delete-button"><i className="ri-delete-bin-5-line"></i></Button>
            <img src="/qrcode.png" width={'100%'} alt="dummie qrcode"  className="d-flex mx-auto justify-content-center qr-image" />
          </div>
        </div>
      </>
    )
  }

  const handleDeleteBtn = (event) => {
    const targetItemDrag = event.currentTarget.getAttribute("itemdrag");
    // console.log('deleting index '+ targetItemDrag)
    // deleting using array index
    // setItemdraggables(itemdraggables.filter((_,i) => i !== index))
    setItemdraggables(itemdraggables.filter(item => item.id !== targetItemDrag))
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
                        <QrDraggables elements={itemdraggablesRef.current} page={pageNumber} />
                    
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
                  <h3 className="text-center">QR Code Properties</h3>
                  <Row className="mt-5 d-flex justify-content-center">
                    <Button className="btn-sm w-25" onClick={handleQrClick}>Add QR Code</Button>
                  </Row>
                  <Row>
                    <pre className="mt-5 show-array">{showUpdateRef.current}</pre>
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

export default DragDropPage;