const { FontAwesomeIcon } = require("@fortawesome/react-fontawesome");

class ParkingLot {
  constructor({type, occupiedBy = null, position, onRemove}) {
    this.type = type;
    this.occupiedBy = occupiedBy;
    this.position = position;
    this.occupiedDate = null;
    this.onRemove = onRemove;
  }

  setOccupiedBy = (vehicle) => {
    this.occupiedBy = vehicle;
    this.occupiedDate = Date.now();
  }

  removeOccupied = () => {
    this.occupiedBy = null;
    this.occupiedDate = null;
  }

  displayVehicle = () => {
    switch(this.type) {
      case "sp":
        return <><FontAwesomeIcon icon="fa-solid fa-car-side" size="2x" /><div>Small Type</div></>;
      case "mp":
        return <><FontAwesomeIcon icon="fa-solid fa-van-shuttle" size="2x" /><div>Medium Type</div></>;
      case "lp":
        return <><FontAwesomeIcon icon="fa-solid fa-truck" size="2x" /><div>Large Type</div></>;
      default:
        return <><FontAwesomeIcon icon="fa-solid fa-image" size="2x" /><div></div></>;
    }
  }

  render = () => {
    return (
      <>
        <button className={"btn " + ((this.occupiedBy) ? "btn-outline-success" : "btn-outline-danger")}>
          { this.displayVehicle() }
          <div>{(this.occupiedBy) ? "Occupied" : "Empty"}</div>
        </button>
      </>
    );
  }
}

export default ParkingLot;