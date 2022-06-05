class Vehicle {
  constructor({type, plate}) {
    this.type = type;
    this.plate = plate;
    
    let allowed;
    switch(type) {
      case "s":
        allowed = ["sp", "mp", "lp"];
        break;
      case "m":
        allowed = ["mp", "lp"];
        break;
      case "l":
        allowed = ["lp"];
        break;
      default:
        allowed = [];
        break;
    }
    this.allowed_ptype = allowed;
  }
}

export default Vehicle;