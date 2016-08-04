export class LocalZone {

  name(){
    return null;
  }

  universal() {
    return false;
  }

  offset(ts){
    return -(new Date(ts).getTimezoneOffset());
  }

  equals(otherZone){
    return (otherZone instanceof LocalZone);
  }
}
