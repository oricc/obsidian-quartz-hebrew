import { formatDate, getDate } from "./Date"
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import readingTime from "reading-time"

const MILLIS_IN_SECOND = 1000
const MILLIS_IN_MINUTE = 60*MILLIS_IN_SECOND;

export default (() => {
  function ContentMetadata({ cfg, fileData, displayClass }: QuartzComponentProps) {
    const text = fileData.text
    if (text) {
      const segments: string[] = []
      const { text: timeTaken, minutes,time, words: _words } = readingTime(text)

      if (fileData.dates) {
        segments.push(formatDate(getDate(cfg, fileData)!))
      }

      segments.push(hebrewReadingTime(time))
      return <p class={`content-meta ${displayClass ?? ""}`}>{segments.join(", ")}</p>
    } else {
      return null
    }
  }

  function hebrewReadingTime(millis:number): string{
    let unit: string = 'דקות';
    let humanFriendlyAmount = millis;
    
    if(millis < MILLIS_IN_MINUTE){
      unit = 'שניות'
      humanFriendlyAmount = Math.round(millis/MILLIS_IN_SECOND);
    } else{
      humanFriendlyAmount= Math.round(millis/MILLIS_IN_MINUTE)
    }
     

    return `${humanFriendlyAmount} ${unit} קריאה`

  }

  ContentMetadata.css = `
  .content-meta {
    margin-top: 0;
    color: var(--gray);
  }
  `
  return ContentMetadata
}) satisfies QuartzComponentConstructor
