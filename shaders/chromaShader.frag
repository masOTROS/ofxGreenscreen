//
// Fragment shader for Background
//
//

#define M_PI 3.1415926535897932384626433832795
#extension GL_ARB_texture_rectangle : enable

varying vec2 texcoord;
uniform sampler2DRect input;
uniform float backHue;
uniform float amount;
uniform float strengthChromaMask;
uniform int doChromaMask;
uniform int doGreenSpill;


//Ref: http://docs.opencv.org/modules/imgproc/doc/miscellaneous_transformations.html
//      cvtColor(src, bwsrc, CV_RGB2HSV);
vec3 convertRGBtoHSV(vec3 rgbColor) {
    float r = rgbColor[0];
    float g = rgbColor[1];
    float b = rgbColor[2];
    float colorMax = max(max(r,g), b);
    float colorMin = min(min(r,g), b);
    float delta = colorMax - colorMin;
    float h = 0.0;
    float s = 0.0;
    float v = colorMax;
    vec3 hsv = vec3(0.0);
    if (colorMax != 0.0) {
      s = (colorMax - colorMin ) / colorMax;
    }
    if (delta != 0.0) {
        if (r == colorMax) {
            h = (g - b) / delta;
        } else if (g == colorMax) {        
            h = 2.0 + (b - r) / delta;
        } else {    
            h = 4.0 + (r - g) / delta;
        }
        h *= 60.0;
        if (h < 0.0) {
            h += 360.0;
        }
    }
    hsv[0] = h;
    hsv[1] = s;
    hsv[2] = v;
    return hsv;
}

void main (void)
{
	vec4 rgbaInput = texture2DRect(input, texcoord);

    vec3 hsvInput = convertRGBtoHSV(rgbaInput.rgb);

    float f = sin( 2. * M_PI * ( backHue + ( .25 - hsvInput.x/180. )));

    if(doChromaMask!=0) {
        float fi = f;
        if(fi>1.)
            fi = 1.;
        if(fi<0.)
            fi = 0.;
        //maskChroma.at<unsigned char>(y, x) = fi*255;
    }
    if(doGreenSpill!=0) {
        f = f * amount;
        if(f<0.)
            f = 0.;
        else if(f>1.)
            f = 1.;

        hsvInput.y *= 1.-f;
    }
/*
    if(doGreenSpill) {
        cvtColor(hsvInput, input, CV_HSV2RGB);
        split(input, rgbInput);
        red = rgbInput[0];
        green = rgbInput[1];
        blue = rgbInput[2];
    }
*/

    //work on the chroma mask
    f=1-f;
    //blur(maskChroma, maskChroma, cv::Size(5, 5));
    f -= (1.-strengthChromaMask);
    f *= strengthChromaMask;

	gl_FragColor = vec4(f);


    /*
        for(int y=0; y < height; y++) {
            for(int x=0; x < width; x++) {
                float f =  sin( 2 * PI * ( hue + ( .25 - hsvInput.at<Vec3b>(y, x)[0]/180. )));
                if(doChromaMask) {
                    float fi = f;
                    if(fi>1)
                        fi = 1;
                    if(fi<0)
                        fi = 0;
                    maskChroma.at<unsigned char>(y, x) = fi*255;
                }
                if(doGreenSpill) {
                    f = f * amount;
                    if(f<0)
                        f = 0;
                    else if(f>1)
                        f = 1;
                    hsvInput.at<Vec3b>(y, x)[1] *= 1-f;
                }
            }
        }

        if(doGreenSpill) {
            cvtColor(hsvInput, input, CV_HSV2RGB);
            split(input, rgbInput);
            red = rgbInput[0];
            green = rgbInput[1];
            blue = rgbInput[2];
        }

        //work on the chroma mask
        bitwise_not(maskChroma, maskChroma);
        blur(maskChroma, maskChroma, cv::Size(5, 5));
        maskChroma -= (1-strengthChromaMask)*255;
        maskChroma *= strengthChromaMask;
    */
}
