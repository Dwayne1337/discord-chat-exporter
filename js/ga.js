import { sendAli } from "../../src/utils/sendAli"

const extGa = {
  event:function(a,b,c){
    sendAli(a,b,c)
  }
}
 export { extGa }