

export default class HomeService{
    static loadHTML(query: any){
        return Bun.file("./src/public/welcome.html").text();
    }
} 