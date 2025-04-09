import { ReactElement } from "react";

type Variants = "primary" | "secondary";

interface ButtonProps{
    variant : Variants;
    size : "sm" | "md" | "lg";
    text : string;
    startIcon?: ReactElement;
    endIcon?: ReactElement;
    onClick? : () => void;
    fullwidth? : boolean;
    loading? : boolean;
}

 const variantStyles = {
      "primary" : "bg-indigo-600 text-white",
      "secondary" : "bg-indigo-100 text-indigo-600"
 }

 const defaultStyles = "rounded-md flex font-extralight items-center"

 const sizeStyles = {
   "sm" : "px-2 py-1" ,
   "md" : "px-4 py-2",
   "lg" : "px-6 py-3"
 }

 export const Button = (props : ButtonProps) => {
    return <button onClick = {props.onClick} className={`${variantStyles[props.variant]} ${defaultStyles} ${sizeStyles[props.size]} ${props.fullwidth ? " w-full flex justify-center items-center" : ""} ${"cursor-pointer"} ${props.loading ? "opacity-70" : ""}`} disabled = {props.loading}>
      {props.startIcon ? <div className = "pr-2 flex items-center">{props.startIcon}</div> : null}
      {props.loading ? "Loading...." : props.text} 
      {props.endIcon ? <div className = "pl-2 flex items-center">{props.endIcon}</div> : null}
    </button>;
 }

//  <Button variant = "primary" size = "md" text = "hi" onClick = {() => {}} />