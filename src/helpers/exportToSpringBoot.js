function generateSpringBootEntity(diagramData) {
    let result = '';

    diagramData.nodes.forEach(node => {
        const className = node.data.label;
        const fields = node.data.atributos;
        const types = node.data.tipos;
        const primaryKey = node.data.primaryKey;

        // Detectar si el nodo extiende de otro (herencia)
        const parentClass = diagramData.edges.find(edge => edge.source === node.id && edge.data.tipo === 'Herencia');
        const extendsClause = parentClass ? ` extends ${diagramData.nodes.find(n => n.id === parentClass.target).data.label}` : '';

        // Generar la entidad con herencia si aplica
        result += `import javax.persistence.*;\n\n`;
        result += `@Entity\npublic class ${className}${extendsClause} {\n`;

        // Agregar los campos de la entidad
        fields.forEach((field, index) => {
            const fieldType = types[index];
            const isPrimaryKey = primaryKey[index];
            result += isPrimaryKey ? `\t@Id\n` : '';
            result += `\tprivate ${convertType(fieldType)} ${field};\n\n`;
        });

        // Detectar relaciones basadas en los edges (Herencia, Composición, Agregación, Asociación, Dependencia)
        diagramData.edges.forEach(edge => {
            if (edge.source === node.id || edge.target === node.id) {
                const relationType = edge.data.tipo;
                const relatedClassName = diagramData.nodes.find(n => n.id === (edge.source === node.id ? edge.target : edge.source)).data.label;

                switch (relationType) {
                    case 'Herencia':
                        // Ya manejado en extendsClause
                        break;

                    case 'Composición':
                        result += `\t@OneToOne(cascade = CascadeType.ALL)\n`;
                        result += `\tprivate ${relatedClassName} ${relatedClassName.toLowerCase()};\n\n`;
                        break;

                    case 'Agregación':
                        result += `\t@OneToMany(mappedBy = "${className.toLowerCase()}", cascade = CascadeType.ALL)\n`;
                        result += `\tprivate List<${relatedClassName}> ${relatedClassName.toLowerCase()}s = new ArrayList<>();\n\n`;
                        break;

                    case 'Asociación':
                        result += `\t@ManyToMany\n`;
                        result += `\tprivate List<${relatedClassName}> ${relatedClassName.toLowerCase()}s;\n\n`;
                        break;

                    case 'Dependencia':
                        result += `\t@ManyToOne\n`;
                        result += `\t@JoinColumn(name = "${className.toLowerCase()}_id")\n`;
                        result += `\tprivate ${relatedClassName} ${relatedClassName.toLowerCase()};\n\n`;
                        break;

                    default:
                        break;
                }
            }
        });

        // Agregar getters y setters
        fields.forEach((field, index) => {
            const fieldType = types[index];
            result += `\tpublic ${convertType(fieldType)} get${capitalizeFirstLetter(field)}() {\n`;
            result += `\t\treturn ${field};\n\t}\n\n`;
            result += `\tpublic void set${capitalizeFirstLetter(field)}(${convertType(fieldType)} ${field}) {\n`;
            result += `\t\tthis.${field} = ${field};\n\t}\n\n`;
        });

        result += `}\n\n`;

        // Generar el repositorio con una estructura estándar
        result += `import org.springframework.data.jpa.repository.JpaRepository;\n`;
        result += `import org.springframework.stereotype.Repository;\n\n`;
        result += `@Repository\n`;
        result += `public interface ${className}Repository extends JpaRepository<${className}, Long> {\n`;

        // Método personalizado genérico para el repositorio
        if (fields.length > 0) {
            const exampleField = fields[0];
            result += `\t// Método personalizado para buscar por ${exampleField}\n`;
            result += `\tList<${className}> findBy${capitalizeFirstLetter(exampleField)}(${convertType(types[0])} ${exampleField});\n`;
        }
        result += `}\n\n`;

        // Generar el servicio
        result += `import org.springframework.beans.factory.annotation.Autowired;\n`;
        result += `import org.springframework.stereotype.Service;\n\n`;
        result += `import java.util.List;\n\n`;
        result += `@Service\npublic class ${className}Service {\n\n`;
        result += `\t@Autowired\n\tprivate ${className}Repository ${className.toLowerCase()}Repository;\n\n`;
        result += `\tpublic List<${className}> findAll() {\n\t\treturn ${className.toLowerCase()}Repository.findAll();\n\t}\n\n`;
        result += `\tpublic ${className} save(${className} ${className.toLowerCase()}) {\n\t\treturn ${className.toLowerCase()}Repository.save(${className.toLowerCase()});\n\t}\n\n`;
        result += `\tpublic void deleteById(Long id) {\n\t\t${className.toLowerCase()}Repository.deleteById(id);\n\t}\n\n`;
        result += `}\n\n`;

        // Generar el controlador
        result += `import org.springframework.beans.factory.annotation.Autowired;\n`;
        result += `import org.springframework.http.ResponseEntity;\n`;
        result += `import org.springframework.web.bind.annotation.*;\n\n`;
        result += `import java.util.List;\n\n`;
        result += `@RestController\n@RequestMapping("/api/${className.toLowerCase()}")\n`;
        result += `public class ${className}Controller {\n\n`;
        result += `\t@Autowired\n\tprivate ${className}Service ${className.toLowerCase()}Service;\n\n`;
        result += `\t@GetMapping\n\tpublic List<${className}> getAll${className}s() {\n\t\treturn ${className.toLowerCase()}Service.findAll();\n\t}\n\n`;
        result += `\t@PostMapping\n\tpublic ${className} create${className}(@RequestBody ${className} ${className.toLowerCase()}) {\n\t\treturn ${className.toLowerCase()}Service.save(${className.toLowerCase()});\n\t}\n\n`;
        result += `\t@DeleteMapping("/{id}")\n\tpublic ResponseEntity<?> delete${className}(@PathVariable Long id) {\n\t\t${className.toLowerCase()}Service.deleteById(id);\n\t\treturn ResponseEntity.ok().build();\n\t}\n\n`;
        result += `}\n\n`;
    });

    return result;
}

// Funciones auxiliares para la conversión de tipos y la capitalización
function convertType(type) {
    switch (type) {
        case 'Text':
            return 'String';
        case 'Integer':
            return 'int';
        case 'Float':
            return 'float';
        case 'Date':
            return 'LocalDate';
        case 'DateTime':
            return 'LocalDateTime';
        default:
            return 'String';
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export { generateSpringBootEntity };
