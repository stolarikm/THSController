import {useState} from 'react';

export function useLoading(){
  const [isLoading, setLoading] = useState(false);

  const startLoading = () => {
    console.log("starting");
    setLoading(true);
  }

  const finishLoading = () => {
    console.log("finishing");
    setLoading(false);
  }

  return {isLoading, startLoading, finishLoading};
}