load("render.star", "render")
load("http.star", "http")
load("encoding/json.star", "json")
load("encoding/base64.star", "base64")
load("math.star", "math")

def main(config):
    print(config["this"])
    return render.Root(
        child = render.Text("hi")
    )
