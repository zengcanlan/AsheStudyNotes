import xml.etree.ElementTree as ET

file_path = 'test.xml'
# 读取XML文件
tree = ET.parse(file_path)
root = tree.getroot()

print(root)




for country in root:
    print(" ",country)
    for element in country:
        #print(" "," ",element)
        print(" "," "," ",element.tag, element.text)
        if (element.text and ("zhp" in element.text)):
            print('-------------')
            break
    
for element in country:
    print(" "," "," ",element.tag, element.text)
    if (element.tag == 'term2'):
        element.text = 'zhp2'
        print('OK')
        break
tree.write(file_path)