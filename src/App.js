import { useEffect, useState } from 'react';

import './css/App.css';

import { Container, Form, InputGroup, Navbar, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import ParkingLot from './class/ParkingLot';
import Vehicle from './class/Vehicle';
import { setAlert } from './Alert/Alert';

const default_mapGrid = {x: 5, y: 4};
const defaultData = {
  parking_lot_types: [
    { type: "sp", size: 6 },
    { type: "mp", size: 7 },
    { type: "lp", size: 7 }
  ],
  entry_points: [
    { name: 'Sample A', pos: { x: 4, y: 0 } },
    { name: 'Sample B', pos: { x: 0, y: 5 } },
    { name: 'Sample C', pos: { x: 0, y: 3 } }
  ]
};


function App() {
  const [parkingLots, setParkingLots] = useState([]);
  const [mapGrid, setMapGrid] = useState(default_mapGrid);
  const [parkingLotTypes, setParkingLotTypes] = useState(defaultData.parking_lot_types);
  const [entryPoints, setEntryPoints] = useState(defaultData.entry_points);

  const [newVehicleType, setNewVehicleType] = useState('s');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');

  useEffect(() => {
    if (parkingLots.length === 0) {
      let numberOfParkingLots = 0;
      Object.values(parkingLotTypes).forEach((p_lot_type) => {
        numberOfParkingLots += p_lot_type.size;
      });

      let posX = 0;
      let posY = 0;
      let p_lot_curr = 0;
      let p_lot_types_count = 0;

      for (let x = 0; x < numberOfParkingLots; x++) {
        if (parkingLots.length <= numberOfParkingLots) {
          posX++;
          p_lot_types_count++;

          const parkingLot = new ParkingLot({ type: parkingLotTypes[p_lot_curr]?.type, position: { x: posX, y: posY } });
          setParkingLots(prev => [...prev, parkingLot]);
        
          if (posX === mapGrid.x) {
            posY++;
            posX = 0;
          }
          if (p_lot_types_count === parkingLotTypes[p_lot_curr]?.size) {
            p_lot_curr++;
            p_lot_types_count = 0;
          }
        }
      }
    }
  }, [parkingLots, mapGrid, parkingLotTypes, entryPoints]);

  const displayEntryPoint = (posX, posY) => {
    let displayElement;
    Object.values(entryPoints).forEach((entry) => {
      if (entry.pos.x === posX && entry.pos.y === posY) {
        displayElement = (<button className="entry-point btn btn-outline-primary" onClick={() => enterNewVehicle(entry)}>
            <FontAwesomeIcon icon="fa-solid fa-door-open" size="2x" />
            <div>{entry.name} Entry</div>
          </button>);
      }
    });

    return displayElement;
  }

  const displayParkingLot = (index) => {
    let displayElement = <Table responsive className="parking-lot-table">
      <thead>
        <tr>
          <th>x y</th>
          {[...Array(mapGrid.x + 1)].map((value, i) => <td key={i}>{i}</td>)}
        </tr>
      </thead>
      <tbody>
        {
          [...Array(mapGrid.y + 1)].map((yvalue, yindex) => {
            return (<tr key={yindex}>
              <td>{yindex}</td>
              <td>{displayEntryPoint(yindex, 0)}</td>
              {
                (yindex === 0) ? [...Array(mapGrid.x)].map((xvalue, xindex) => <td key={xindex}>{displayEntryPoint(0, xindex+1)}</td>) :
                parkingLots.slice((yindex-1) * mapGrid.x, ((yindex-1) * mapGrid.x) + mapGrid.x).map((plvalue, plindex) => {
                  if (plvalue?.type) {
                    return <td key={plindex}><div className="parking-lot" onClick={() => removeVehicle(plvalue)}>{plvalue?.render()}</div></td>
                  }
                })
              }
            </tr>
            )
          })
        }
      </tbody>
    </Table>

    return displayElement;
  }

  const enterNewVehicle = (entry_point) => {
    if (newVehicleType && newVehiclePlate) {
      const vehicle = new Vehicle({type: newVehicleType, plate: newVehiclePlate});
      const availableParkingLots = parkingLots.filter((parkingLot) => (vehicle.allowed_ptype.indexOf(parkingLot.type) !== -1) && (!parkingLot.occupiedBy));
      if (availableParkingLots.length > 0) {
        let closestParkingLot = availableParkingLots[0];
        let shortestDistance = DistSquared(entry_point.pos, availableParkingLots[0].position);
        availableParkingLots.map((pvalue) => {
          const d = DistSquared(entry_point.pos, pvalue.position);
          if (d < shortestDistance) {
            closestParkingLot = pvalue;
            shortestDistance = d;
          }
        });
    
        const index = parkingLots.findIndex((value) => value.position === closestParkingLot.position);
        parkingLots[index].setOccupiedBy(vehicle);
        setParkingLots(prev => [...prev, parkingLots]);
        setNewVehiclePlate('');
      }
      else {
        setAlert("Enter New Vehicle", "No available lot.", "danger");
      }
    }
    else {
      setAlert("Enter New Vehicle", "Please enter car plate number.", "danger");
    }
  }

  const removeVehicle = (parkingLot) => {
    const index = parkingLots.findIndex((value) => value.position === parkingLot.position);
    if (parkingLots[index]?.occupiedBy) {
      const parkingLotData = parkingLots[index];
      CalculateFee(parkingLotData, index);
    }
  }
  
  const CalculateFee = (parkingLotData, index) => {
    const defaultHour = 3;
    const defaultRate = 40;
    let rate = 0;
    let totalPayment = 0;
    let remainingHours = 0;

    const occupiedDate = parkingLotData.occupiedDate;
    const dateDiff = Date.now() - occupiedDate;
    const hours = Math.ceil(dateDiff / (1000 * 60 * 60) % 24);
    // const hours = 23;
    
    if (hours >= 24) {
      totalPayment += 5000;
      remainingHours = hours - 24;
    }
    else if (hours >= 3) {
      totalPayment += defaultHour * defaultRate;
      remainingHours = hours - defaultHour;
    }
    else {
      totalPayment += hours*defaultRate;
    }

    switch(parkingLotData.type) {
      case 'sp':
        rate = 20;
        break;
      case 'mp':
        rate = 60;
        break;
      case 'lp':
        rate = 100;
        break;
      default:
        rate = defaultRate;
        break;
    }
    totalPayment += remainingHours * rate;

    if (window.confirm("Total to Pay: " + totalPayment + "\n" +
    "Vehicle Plate Number: " + parkingLotData.occupiedBy.plate + "\n" +
    "Parking Type: " + parkingLotData.type + "\n" +
    "Vehicle Type: " + parkingLotData.occupiedBy.type + "\n" +
    "Parking Rate: " + rate + " per hour\n" +
    "Hours: " + hours + " hrs\n" +
    "\nAre you sure to exit parking lot?")) {
      parkingLots[index]?.removeOccupied();
      setParkingLots(prev => [...prev, parkingLots]);
      setAlert("Remove Vehicle", "Vehicle removed.", "success");
    }
  }

  const DistSquared = (pt1, pt2) => {
    var diffX = pt1.y - pt2.x;
    var diffY = pt1.x - pt2.y;
    return ((diffX*diffX) + (diffY*diffY));
  }

  return (
    <>
      <Navbar collapseOnSelect expand="lg" variant="dark" bg="dark">
        <Container>
          <Navbar.Brand href="/parking-lot-system"><FontAwesomeIcon icon="fa-solid fa-building" /> Parking Lot</Navbar.Brand>
        </Container>
      </Navbar>

      <div id="#admin">
        <Container className="mt-4">
          <div className="new-vehicle my-form pos-relative mb-3 mt-4 col-12">
            <h5 className="my-form-admin-header text-truncate">Admin</h5>
            <Form>
              <div className="row">
                <Form.Group className="mb-3 col-12 col-xs-12 col-sm-12 col-md-8 col-lg-4" controlId="formVehicleType">
                  <Form.Label>Map Grid Size</Form.Label>
                  <div className="row">
                    <div className="col-6">
                      <InputGroup>
                        <Form.Control type="number"
                          value={mapGrid.x}
                          onChange={
                            (e) => setMapGrid(prev => {
                              e.preventDefault();
                              setParkingLots([]);
                              prev.x = (e.target.value*1);
                              return prev;
                            })
                          }
                          />
                        <InputGroup.Text>Pos X</InputGroup.Text>
                      </InputGroup>
                    </div>
                    <div className="col-6">
                      <InputGroup>
                        <Form.Control type="number"
                          value={mapGrid.y}
                          onChange={
                            (e) => setMapGrid(prev => {
                              e.preventDefault();
                              setParkingLots([]);
                              prev.y = (e.target.value*1);
                              return prev;
                            })
                          }
                          />
                        <InputGroup.Text>Pos Y</InputGroup.Text>
                      </InputGroup>
                    </div>
                  </div>
                </Form.Group>
                <Form.Group className="mb-3 col-12" controlId="formVehicleType">
                  <Form.Label>Parking Lot Types and Sizes</Form.Label>
                  <div className="row">
                    <div className="col-12 col-xs-12 col-sm-6 col-md-4 col-lg-3 mb-2">
                      <InputGroup>
                        <Form.Control type="number"
                          value={parkingLotTypes[0].size}
                          onChange={
                            (e) => setParkingLotTypes(prev => {
                              e.preventDefault();
                              setParkingLots([]);
                              prev[0].size = (e.target.value*1);
                              return prev;
                            })
                          }
                          />
                        <InputGroup.Text><FontAwesomeIcon icon="fa-solid fa-car-side" /> Small</InputGroup.Text>
                      </InputGroup>
                    </div>
                    <div className="col-12 col-xs-12 col-sm-6 col-md-4 col-lg-3 mb-2">
                      <InputGroup>
                        <Form.Control type="number"
                          value={parkingLotTypes[1].size}
                          onChange={
                            (e) => setParkingLotTypes(prev => {
                              e.preventDefault();
                              setParkingLots([]);
                              prev[1].size = (e.target.value*1);
                              return prev;
                            })
                          }
                          />
                        <InputGroup.Text><FontAwesomeIcon icon="fa-solid fa-van-shuttle" /> Medium</InputGroup.Text>
                      </InputGroup>
                    </div>
                    <div className="col-12 col-xs-12 col-sm-6 col-md-4 col-lg-3 mb-2">
                      <InputGroup>
                        <Form.Control type="number"
                          value={parkingLotTypes[2].size}
                          onChange={
                            (e) => setParkingLotTypes(prev => {
                              e.preventDefault();
                              setParkingLots([]);
                              prev[2].size = (e.target.value*1);
                              return prev;
                            })
                          }
                          />
                        <InputGroup.Text><FontAwesomeIcon icon="fa-solid fa-truck" /> Large</InputGroup.Text>
                      </InputGroup>
                    </div>
                  </div>
                </Form.Group>
                <Form.Group className="mb-3 col-12" controlId="formVehicleType">
                  <Form.Label>Entry Points</Form.Label>
                  <div className="row">
                    {(entryPoints.length > 0) ? (entryPoints.map((value, index) => {
                      return (
                        <div className="col-12 col-xs-12 col-sm-6 col-md-6 col-lg-3" key={index}>
                          <InputGroup className="mb-2">
                            <Form.Control type="text" value={value.name} onChange={(e) => 
                              setEntryPoints(prev => {
                                prev[index].name = e.target.value;
                                setParkingLots([]);
                                return prev;
                              })
                            } />
                            <InputGroup.Text>Name</InputGroup.Text>
                          </InputGroup>
                          <InputGroup className="mb-2">
                            <Form.Control type="number" value={value.pos.x} onChange={(e) => 
                              setEntryPoints(prev => {
                                prev[index].pos.x = (e.target.value*1);
                                setParkingLots([]);
                                return prev;
                              })
                            } />
                            <InputGroup.Text>Pos X</InputGroup.Text>
                          </InputGroup>
                          <InputGroup className="mb-2">
                            <Form.Control type="number" value={value.pos.y} onChange={(e) => 
                              setEntryPoints(prev => {
                                prev[index].pos.y = (e.target.value*1);
                                setParkingLots([]);
                                return prev;
                              })
                            } />
                            <InputGroup.Text>Pos Y</InputGroup.Text>
                          </InputGroup>
                        </div>
                      );
                    })) : <h5>No Entry Points</h5>}
                    <button className="btn btn-primary" onClick={(e) => setEntryPoints(prev => {
                      e.preventDefault();
                      prev.push({name: "New " + (entryPoints.length+1), pos: {x: 0, y: 0}});
                      setParkingLots([]);
                      return prev;
                    })}>Add new Entry Points</button>
                  </div>
                </Form.Group>
              </div>
            </Form>
          </div>
        </Container>
      </div>
      <div id="#home">
        <Container className="mt-4">
          <h3>Welcome to Object Oriented Mall!</h3>
          <div className="new-vehicle my-form pos-relative mb-3 mt-4 col-12">
            <h5 className="my-form-admin-header text-truncate">New Vehicle Details</h5>
            <Form>
              <div className="row">
                <Form.Group className="mb-3 col-12 col-xs-12 col-sm-6 col-md-4 col-lg-3" controlId="formVehicleType">
                  <Form.Label>Type</Form.Label>
                  <Form.Select onChange={(e) => setNewVehicleType(e.target.value)} value={newVehicleType}>
                    <option value='s'>Small</option>
                    <option value='m'>Medium</option>
                    <option value='l'>Large</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3 col-12 col-xs-12 col-sm-6 col-md-4 col-lg-3" controlId="formPlateNumber">
                  <Form.Label>Plate Number</Form.Label>
                  <Form.Control type="text" placeholder="Plate Number" onChange={(e) => setNewVehiclePlate(e.target.value)} value={newVehiclePlate} />
                </Form.Group>
                <div className="mb-3 col-12 col-xs-12 col-sm-6 col-md-4 col-lg-6">
                  <div>
                    Please select below Entry Point. A vehicle can be assigned a possible and available slot closest to the parking entrance.
                    Vehicle Type and Plate Number are required fields.
                  </div>
                </div>
              </div>
            </Form>
          </div>
        </Container>
      </div>
      <div id="#parking">
        <Container className="mt-4">
          <div className="new-vehicle my-form pos-relative mb-3 mt-4 col-12">
            <h5 className="my-form-admin-header text-truncate">Parking Lot</h5>
            { (parkingLots?.length > 0) ? displayParkingLot() : <div>No Parking Lot</div> }
          </div>
        </Container>
      </div>
    </>
  );
}

export default App;
