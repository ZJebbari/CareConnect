
export class Helper {
  
  public static PhoneNumber(value: string | any): string {
      if (!value) return '';
  
      const digits = value.toString().replace(/\D/g, '');
      if (digits.length !== 10) return value.toString();
  
      const area = digits.slice(0, 3);
      const prefix = digits.slice(3, 6);
      const line = digits.slice(6);
  
      return `${area}-${prefix}-${line}`;
  }

  public static restoreIfEmptyField(current: any | null, setter: (value: any | null) => void, original: any){
    if (!current || current.trim() === '') {
      setter(original)
    }
  }
}


